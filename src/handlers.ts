import { HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { LambdaProxyIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Construct } from "constructs";
import {
  NodejsFunctionProps,
  NodejsFunction,
} from "../constructs/NodejsFunction";
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
    { apiGateway, provider, secrets, cognitoRedirectUri }: HandlersProps
  ) {
    super(scope, id);

    this.apiGateway = apiGateway;
    this.provider = provider;
    this.secrets = secrets;
    this.cognitoRedirectUri = cognitoRedirectUri;

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
        integration: new LambdaProxyIntegration({ handler: handlerFunc }),
        path: lambdaConfig.path,
      });
    });
  }
}
