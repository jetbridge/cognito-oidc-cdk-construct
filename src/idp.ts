import {
  CfnUserPoolIdentityProvider,
  CfnUserPoolIdentityProviderProps,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

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
