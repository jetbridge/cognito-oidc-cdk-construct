import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda"
import { getOidcController } from "./util/getController"
import { URLSearchParams } from "url"
import * as auth from "./util/auth"

const parseBody = (event: any) => {
  const body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf-8") : event.body
  const contentType = event.headers["content-type"]
  if (!body) return {}
  if (contentType.startsWith("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(body)
    return {
      code: params.get("code"),
      state: params.get("state"),
    }
  }
  if (contentType.startsWith("application/json")) {
    return JSON.parse(body)
  }
}

export const handler = (event: APIGatewayProxyEvent, _context: Context, callback: Callback) => {
  const body = parseBody(event)
  const query = event.queryStringParameters || {}
  const code = body.code || query.code
  const state = body.state || query.state
  getOidcController(callback).token(code, state, auth.getIssuer(event))
}
