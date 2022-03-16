import {
  CfnUserPoolIdentityProvider,
  CfnUserPoolIdentityProviderProps,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "aws-cdk-lib/core";

export class Idp extends CfnUserPoolIdentityProvider {
  constructor(
    scope: Construct,
    id: string,
    props: CfnUserPoolIdentityProviderProps
  ) {
    super(scope, id, {
      ...props,
      providerName: id,
      providerType: "OIDC",
    });
  }
}
