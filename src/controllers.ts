import { responder } from "./util/responder"
import { OpenID } from "./openid"

export const Controllers = (openid: OpenID) => (respond: ReturnType<typeof responder>) => ({
  authorize: (client_id: any, scope: any, state: any, response_type: any) => {
    return openid.getAuthorizeUrl(client_id, scope, state, response_type).then((authorizeUrl: any) => {
      console.info("Redirecting to authorizeUrl")
      console.debug("Authorize Url is: %s", authorizeUrl, {})
      respond.redirect(authorizeUrl)
    })
  },
  userinfo: (tokenPromise: any) => {
    tokenPromise
      .then((token: any) => openid.getUserInfo(token))
      .then((userInfo: any) => {
        console.debug("Resolved user infos:", userInfo, {})
        respond.success(userInfo)
      })
      .catch((error: any) => {
        console.error("Failed to provide user info: %s", error.message || error, {})
        respond.error(error)
      })
  },
  token: (code: any, state: any, host: any) => {
    if (code) {
      openid
        .getTokens(code, state, host)
        .then((tokens: any) => {
          // console.debug("Token for (%s, %s, %s) provided", code, state, host, {})
          respond.success(tokens)
        })
        .catch((error: any) => {
          console.error("Token for (%s, %s, %s) failed: %s", code, state, host, error.message || error, {})
          respond.error(error)
        })
    } else {
      const error = new Error("No code supplied")
      console.error("Token for (%s, %s, %s) failed: %s", code, state, host, error.message || error, {})
      respond.error(error)
    }
  },
  jwks: () => {
    openid.getJwks().then((jwks: any) => {
      console.info("Providing access to JWKS: %j", jwks, {})
      respond.success(jwks)
    })
  },
  openIdConfiguration: (host: any) => {
    const config = openid.getConfigFor(host)
    console.info("Providing configuration for %s: %j", host, config, {})
    respond.success(config)
  },
})
