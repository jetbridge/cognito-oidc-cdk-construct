import { URLSearchParams } from 'url';
import fetch from 'node-fetch';
import * as consts from './consts';
import * as crypto from './crypto';
import * as req from './requests';
import { cognitoRedirectUri } from './types';
import { filterOutScopesForLinkedin } from './util/char';

interface UserDetails {
  id: string;
  firstName?: string;
  lastName?: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  profilePicture?: any; // https://docs.microsoft.com/en-us/linkedin/shared/references/v2/profile/profile-picture
  localizedHeadline?: string;
  vanityName?: string;
}

const getApiEndpoints = (apiBaseUrl: string, loginBaseUrl: string) => {
  return {
    // https://docs.microsoft.com/en-us/linkedin/shared/references/v2/profile/lite-profile
    userDetails: `${apiBaseUrl}/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams),firstName,lastName)`,
    userEmails: `${apiBaseUrl}/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))`,
    oauthToken: `${loginBaseUrl}/oauth/v2/accessToken`,
    oauthAuthorize: `${loginBaseUrl}/oauth/v2/authorization`,
  };
};

const urls = getApiEndpoints(consts.linkedinApiUrl, consts.linkedinLoginUrl);

const getUserDetails = async <RT>(accessToken: string): Promise<RT> => {
  const url = `${urls.userDetails}&oauth2_access_token=${accessToken}`;
  return (await fetch(url)).json() as Promise<RT>;
};

const getUserEmails = async (accessToken: string) => {
  const url = `${urls.userEmails}&oauth2_access_token=${accessToken}`;
  return (await fetch(url)).json();
};

const parseOrigName = (name: any): string | null => {
  // {
  //   "localized": {
  //       "en_US": "Mischa"
  //   },
  //   "preferredLocale": {
  //       "country": "US",
  //       "language": "en"
  //   }
  // }
  if (!name?.preferredLocale || !name?.localized) return null;
  const key = `${name.preferredLocale.language}_${name.preferredLocale.country}`;
  return name.localized[key] || null;
};
const parseLocale = (name: any): string | null => {
  if (!name?.preferredLocale?.country || !name?.preferredLocale?.language) {
    return null;
  }
  return `${name.preferredLocale.language}-${name.preferredLocale.country}`;
};

const parseImageUrl = (imageElements: any[]): string | null => {
  // find best image
  // see https://docs.microsoft.com/en-us/linkedin/shared/references/v2/profile/profile-picture
  if (!imageElements?.length) return null;
  let bestRes = 0;
  let best: any;
  imageElements.forEach((ele) => {
    const width = ele.data?.['com.linkedin.digitalmedia.mediaartifact.StillImage']?.storageSize?.width;
    if (!width || width < bestRes) return;
    bestRes = width;
    best = ele;
  });
  if (!best) return null;
  return best.identifiers?.[0]?.identifier || null;
};

export const linkedin = (secrets: any) => {
  const cert = secrets.JWT_KEY;
  const clientId = secrets.LINKEDIN_CLIENT_ID;
  const redirUrl = process.env[cognitoRedirectUri];
  if (!redirUrl) throw new Error(`missing ${redirUrl} in env`);
  return {
    getAuthorizeUrl: (client_id: any, scope: any, state: any, response_type: any) => {
      const newScope: string = filterOutScopesForLinkedin(scope);
      const queryParameters = new URLSearchParams();
      queryParameters.append('client_id', client_id);
      queryParameters.append('scope', newScope);
      queryParameters.append('state', state);
      queryParameters.append('response_type', response_type);
      queryParameters.append('redirect_uri', redirUrl);
      return `${urls.oauthAuthorize}?${queryParameters.toString()}`;
    },
    getUserInfo: (accessToken: string) => {
      return Promise.all([
        getUserDetails<UserDetails>(accessToken).then((userDetails) => {
          console.log(`userDetails: ${JSON.stringify(userDetails, undefined, 4)}`);
          const pictureElements = userDetails.profilePicture?.['displayImage~']?.elements || [];
          // see: IDP_CONF
          return {
            'sub': userDetails.id,
            'name': `${userDetails.localizedFirstName} ${userDetails.localizedLastName}`,
            'preferred_username': userDetails.vanityName || null,
            'picture': parseImageUrl(pictureElements),
            'locale': parseLocale(userDetails.firstName) || parseLocale(userDetails.lastName),
            // website: `https://www.linkedin.com/in/${userDetails.vanityName}`,

            // custom attributes:
            // 'custom:headline': userDetails.localizedHeadline,
            'custom:first_name_orig': parseOrigName(userDetails.firstName),
            'custom:last_name_orig': parseOrigName(userDetails.lastName),
          };
        }),
        getUserEmails(accessToken).then((userEmails: any) => {
          console.log(`userEmails: ${JSON.stringify(userEmails, undefined, 4)}`);
          return {
            email: userEmails.elements[0]['handle~'].emailAddress,
          };
        }),
      ])
        .then((claims) => {
          const mergedClaims = claims.reduce((acc, claim) => ({ ...acc, ...claim }), {});
          console.debug('Resolved combined claims: %j', mergedClaims, {});
          return mergedClaims;
        })
        .catch((error: any) => {
          console.error(error);
          throw Error(error);
        });
    },
    getToken: (code: any, state: any, host: any) => {
      const data = {
        grant_type: 'authorization_code',
        redirect_uri: process.env[cognitoRedirectUri],
        client_id: secrets.LINKEDIN_CLIENT_ID,
        response_type: 'code',
        client_secret: secrets.LINKEDIN_CLIENT_SECRET,
        code,
        // State may not be present, so we conditionally include it
        ...(state && { state }),
      };

      const parameters = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        parameters.append(key, value as string);
      });

      const url = `${urls.oauthToken}?${parameters.toString()}`;

      return req.post(url).then((linkedinToken: any) => {
        return new Promise((resolve) => {
          const payload = {
            // This was commented because Cognito times out in under a second
            // and generating the userInfo takes too long.
            // It means the ID token is empty except for metadata.
            //  ...userInfo,
          };
          const idToken = crypto.makeIdToken(payload, host, cert, clientId);
          const tokenResponse = {
            ...linkedinToken,
            scope: consts.linkedinScope,
            token_type: 'bearer',
            id_token: idToken,
          };
          // console.debug("Resolved token response: %j", tokenResponse, {})
          resolve(tokenResponse);
        });
      });
    },
  };
};
