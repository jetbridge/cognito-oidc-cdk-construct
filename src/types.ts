import { CfnUserPoolIdentityProviderProps } from "aws-cdk-lib/aws-cognito";

export type OidcProvider = "GITHUB" | "LINKEDIN";

export const oidcProviderEnv = "OIDC_PROVIDER_NAME";

export const oidcSecretName = "OIDC_SECRET_NAME";

export const cognitoRedirectUri = "COGNITO_REDIRECT_URI";

export interface ProviderConfig {
  providerName: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  oidcApiUrl: string;
}

type ProviderConfigMaker = ({
  providerName,
  userPoolId,
  clientId,
  clientSecret,
  oidcApiUrl,
}: ProviderConfig) => CfnUserPoolIdentityProviderProps;

export type ProviderConfigRecord = Record<OidcProvider, ProviderConfigMaker>;
