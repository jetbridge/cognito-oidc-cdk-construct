import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda"
import { getOidcController } from "./util/getController"

export const handler = (event: APIGatewayProxyEvent, _context: Context, callback: Callback) => {
  const { client_id, scope, state, response_type } = event.queryStringParameters || {}
  getOidcController(callback).authorize(client_id, scope, state, response_type)
}
