import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda"
import { getOidcController } from "./util/getController"

export const handler = (_event: APIGatewayProxyEvent, _context: Context, callback: Callback) => {
  getOidcController(callback).jwks()
}
