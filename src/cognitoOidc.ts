import { Construct } from "constructs";
import { HttpApi, HttpApiProps } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
// import { HttpApi, HttpApiProps } from "aws-cdk-lib/aws-apigatewayv2";
import { OidcProvider, ProviderConfig } from "./types";
import { Handlers } from "./handlers";
import { SecretsOidc } from "./secrets";
import { Idp } from "./idp";
import { capitalize } from "./util/char";
import { IDP_CONF } from "./consts";
import { UserPoolClient } from "aws-cdk-lib/aws-cognito";

export interface CognitoOidcProps {
  apiGatewayProps?: HttpApiProps;
  provider: OidcProvider;
  userPoolId: string;
  secrets: SecretsOidc;
  cognitoRedirectUri: string;
  userPoolClients?: UserPoolClient[];
}

export class CognitoOidc extends Construct {
  apiGateway: HttpApi;
  userPoolId: string;
  providerType: OidcProvider;
  idp: Idp;
  providerName: string;
  clientId: string;
  clientSecret: string;
  oidcApiUrl: string;
  secrets: SecretsOidc;

  constructor(
    scope: Construct,
    id: string,
    {
      userPoolClients,
      apiGatewayProps,
      provider,
      userPoolId,
      secrets,
      cognitoRedirectUri,
    }: CognitoOidcProps
  ) {
    super(scope, id);

    this.providerType = provider;
    this.providerName = capitalize(provider);

    this.secrets = secrets;

    this.apiGateway = new HttpApi(scope, `GW${this.providerName}`, {
      ...apiGatewayProps,
      // if createDefaultStage is unset the url is undefined
      // see: aws-cdk-lib/aws-apigatewayv2/lib/http/api.d.ts
      createDefaultStage: true,
    });

    this.userPoolId = userPoolId;
    this.oidcApiUrl = this.apiGateway.url!;

    this.clientId = this.getClientId();
    this.clientSecret = this.getClientSecret();

    this.idp = this.createIdp();

    // need to specify client dependency
    // https://github.com/hollanddd/aws-cdk/commit/72550fec86061ca39b4f5571f120afa3366c39aa
    userPoolClients?.map((client) => {
      // console.log(client, "adding dep on ", tidp)
      // client.node.addDependency(idp)
    });

    new Handlers(this, `HandlersFor${provider}`, {
      provider,
      apiGateway: this.apiGateway,
      secrets: this.secrets,
      cognitoRedirectUri: cognitoRedirectUri,
    });
  }

  getClientId(): string {
    if (this.providerType == "GITHUB") {
      return this.secrets.getSecretValue("githubClientId");
    } else if (this.providerType == "LINKEDIN") {
      return this.secrets.getSecretValue("linkedinClientId");
    } else throw Error(`invalid provider ${this.providerType}`);
  }

  getClientSecret(): string {
    if (this.providerType == "GITHUB") {
      return this.secrets.getSecretValue("githubClientSecret");
    } else if (this.providerType == "LINKEDIN") {
      return this.secrets.getSecretValue("linkedinClientSecret");
    } else throw Error(`invalid provider ${this.providerType}`);
  }

  createIdp() {
    const providerConfig: ProviderConfig = {
      userPoolId: this.userPoolId,
      providerName: this.providerName,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      oidcApiUrl: this.oidcApiUrl,
    };
    return new Idp(
      this,
      this.providerName,
      IDP_CONF[this.providerType](providerConfig)
    );
  }
}
