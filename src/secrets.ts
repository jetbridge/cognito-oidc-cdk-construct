import { Secret, SecretProps } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export const OIDC_SECRETS = {
  jwtRS256Key: 'JWT_KEY', // private key for signing ID Token for OIDC
  jwtRS256KeyPub: 'JWT_KEY_PUB', // public key for signing ID Token for OIDC
  githubClientId: 'GITHUB_CLIENT_ID', // the client ID for Github OAuth
  githubClientSecret: 'GITHUB_CLIENT_SECRET', // the client secret for Github OAuth
  linkedinClientId: 'LINKEDIN_CLIENT_ID', // the client ID for Linkedin OAuth
  linkedinClientSecret: 'LINKEDIN_CLIENT_SECRET', // the client secret for Linkedin OAuth
};

export interface SecretsOidcProps extends SecretProps {}

export class SecretsOidc extends Secret {
  constructor(scope: Construct, id: string, props: SecretsOidcProps) {
    super(scope, id, {
      ...props,

      // secret default template
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          [OIDC_SECRETS.jwtRS256Key]: 'replace me',
          [OIDC_SECRETS.jwtRS256KeyPub]: 'replace me',
          [OIDC_SECRETS.githubClientId]: 'replace me',
          [OIDC_SECRETS.githubClientSecret]: 'replace me',
          [OIDC_SECRETS.linkedinClientId]: 'replace me',
          [OIDC_SECRETS.linkedinClientSecret]: 'replace me',
        }),
        // unused
        // but we need to generate something or it complains
        generateStringKey: 'RANDOM',
      },
    });
  }

  getSecretValue(key: keyof typeof OIDC_SECRETS): string {
    return this.secretValueFromJson(OIDC_SECRETS[key]).toString();
  }
}
