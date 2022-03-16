import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda"
import { getOidcController } from "./util/getController"
import * as auth from "./util/auth"

export const handler = (event: APIGatewayProxyEvent, _context: Context, callback: Callback) => {
  getOidcController(callback).openIdConfiguration(auth.getIssuer(event))
}
