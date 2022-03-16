import { github } from "../github"
import { linkedin } from "../linkedin"
import { OpenID } from "../openid"
import { Controllers } from "../controllers"
import { Callback } from "aws-lambda"
import { OidcProvider, oidcProviderEnv } from "../types"
import { responder } from "./responder"

export function getOidcControllerType() {
  // which provider are we handling?
  const oidcProviderName = process.env[oidcProviderEnv] as OidcProvider
  if (!oidcProviderName) throw new Error(`Missing ${oidcProviderEnv} in environment`)
  switch (oidcProviderName) {
    case "GITHUB":
      return Controllers(new OpenID(github))
    case "LINKEDIN":
      return Controllers(new OpenID(linkedin))
    default:
      throw new Error(`Unknown ${oidcProviderEnv} ${oidcProviderName}`)
  }
}

export function getOidcController(callback: Callback) {
  const controller = getOidcControllerType()
  return controller(responder(callback))
}
