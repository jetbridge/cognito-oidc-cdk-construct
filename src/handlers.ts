/* eslint-disable import/no-extraneous-dependencies */
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { lambdaConfs } from "./consts";
import { SecretsOidc } from "./secrets";
import {
  cognitoRedirectUri,
  OidcProvider,
  oidcProviderEnv,
  oidcSecretName,
} from "./types";

export interface HandlersProps {
  apiGateway: HttpApi;
  provider: OidcProvider;
  secrets: SecretsOidc;
  cognitoRedirectUri: string;
}

export class Handlers extends Construct {
  apiGateway: HttpApi;
  provider: OidcProvider;
  secrets: SecretsOidc;
  cognitoRedirectUri: string;

  constructor(
    scope: Construct,
    id: string,
    {
      apiGateway,
      provider,
      secrets,
      cognitoRedirectUri: cognitoRedirectUri_,
    }: HandlersProps
  ) {
    super(scope, id);

    this.apiGateway = apiGateway;
    this.provider = provider;
    this.secrets = secrets;
    this.cognitoRedirectUri = cognitoRedirectUri_;

    this.createLambdaHandlers();
  }

  /**
   * Creates the lambda handlers and looks up for files called `handlers.${lambdaConfig.name}.ts`
   * for example handlers.authorize.ts
   */
  createLambdaHandlers() {
    // common function props
    const funcPropDefaults: NodejsFunctionProps = {
      memorySize: 1024,
      environment: {
        [oidcSecretName]: this.secrets.secretName,
        [oidcProviderEnv]: this.provider,
        [cognitoRedirectUri]: this.cognitoRedirectUri,
      },
    };

    lambdaConfs.forEach((lambdaConfig) => {
      const handlerFunc = new NodejsFunction(this, lambdaConfig.name, {
        ...funcPropDefaults,
        handler: `packages/infra/lib/cognitoOidc/handlers.${lambdaConfig.name}.handler`,
      });
      this.secrets.grantRead(handlerFunc);
      this.apiGateway.addRoutes({
        integration: new HttpLambdaIntegration(
          `Integration${lambdaConfig.name}`,
          handlerFunc
        ),
        path: lambdaConfig.path,
      });
    });
  }
}
