const { awscdk } = require("projen");
const project = new awscdk.AwsCdkConstructLibrary({
  author: "Mischa Spiegelmock",
  authorAddress: "me@mish.dev",
  cdkVersion: "2.14.0",
  defaultReleaseBranch: "master",
  name: "cognito-oidc-cdk-construct",
  repositoryUrl: "git@github.com:jetbridge/cognito-oidc-cdk-construct.git",

  // deps: [],                /* Runtime dependencies of this module. */
  description:
    "Generate OpenID Connect handlers and configuration for Cognito." /* The description is just a string that helps people understand the purpose of the package. */,
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
