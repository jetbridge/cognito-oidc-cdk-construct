import { ProviderConfigRecord, oidcSecretName } from "./types"

export const githubApiUrl = "https://api.github.com"
export const githubLoginUrl = "https://github.com"

export const linkedinApiUrl = "https://api.linkedin.com"
export const linkedinLoginUrl = "https://linkedin.com"

export const secretPostfix = "oidc-secrets"
export const secretName = process.env[oidcSecretName] || "platform-test-oidc-secrets"

const githubScope = "openid read:user user:email"

// `openid` is an scope required by Cognito
// but Linkedin throws an error if this scope is passed as it is not recognized
// so it needs to be filtered out in the getAuthorizeUrl function
export const linkedinScope = "openid r_liteprofile r_emailaddress"

export const IDP_CONF: ProviderConfigRecord = {
  GITHUB: ({ providerName, userPoolId, clientId, clientSecret, oidcApiUrl }) => ({
    providerName,
    userPoolId,
    providerType: "OIDC",
    attributeMapping: {
      username: "sub",
      email: "email",
      email_verified: "email_verified",
      name: "name",
      picture: "picture",
      preferred_username: "preferred_username",
      profile: "profile",
      updated_at: "updated_at",
      website: "website",
    },
    providerDetails: {
      client_id: clientId,
      client_secret: clientSecret,
      attributes_request_method: "GET",
      oidc_issuer: oidcApiUrl,
      authorize_scopes: githubScope,
      authorize_url: `${oidcApiUrl}auth/oidc/authorize`,
      token_url: `${oidcApiUrl}token`,
      attributes_url: `${oidcApiUrl}userinfo`,
      jwks_uri: `${oidcApiUrl}.well-known/jwks.json`,
    },
  }),
  LINKEDIN: ({ providerName, userPoolId, clientId, clientSecret, oidcApiUrl }) => ({
    providerName,
    userPoolId,
    providerType: "OIDC",
    attributeMapping: {
      username: "sub",
      email: "email",
      name: "name",
      picture: "picture",
      locale: "locale",
      website: "website",
      "custom:headline": "custom:headline",
      "custom:first_name_orig": "custom:first_name_orig",
      "custom:last_name_orig": "custom:last_name_orig",
    },
    providerDetails: {
      client_id: clientId,
      client_secret: clientSecret,
      attributes_request_method: "GET",
      oidc_issuer: oidcApiUrl,
      authorize_scopes: linkedinScope,
      authorize_url: `${oidcApiUrl}auth/oidc/authorize`,
      token_url: `${oidcApiUrl}token`,
      attributes_url: `${oidcApiUrl}userinfo`,
      jwks_uri: `${oidcApiUrl}.well-known/jwks.json`,
    },
  }),
}

export const lambdaConfs = [
  {
    name: "authorize",
    path: "/auth/oidc/authorize",
  },
  {
    name: "config",
    path: "/.well-known/openid-configuration",
  },
  {
    name: "jwks",
    path: "/.well-known/jwks.json",
  },
  {
    name: "token",
    path: "/token",
  },
  {
    name: "userinfo",
    path: "/userinfo",
  },
]
