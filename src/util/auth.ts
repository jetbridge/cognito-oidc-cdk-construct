export const getBearerToken = (req: any) => {
  return new Promise((resolve, reject) => {
    // This method implements https://tools.ietf.org/html/rfc6750
    const authHeader = req.headers.authorization;
    if (!authHeader) console.warn("getBearerToken no auth header");
    if (authHeader) {
      // Section 2.1 Authorization request header
      // Should be of the form 'Bearer <token>'
      // We can ignore the 'Bearer ' bit
      const authValue = authHeader.split(" ")[1];
      resolve(authValue);
    } else if (req.queryStringParameters.access_token) {
      // Section 2.3 URI query parameter
      const accessToken = req.queryStringParameters.access_token;
      resolve(req.queryStringParameters.access_token);
    } else if (
      req.headers["Content-Type"] === "application/x-www-form-urlencoded" &&
      req.body
    ) {
      // Section 2.2 form encoded body parameter
      const body = JSON.parse(req.body);
      resolve(body.access_token);
    } else {
      const msg = "No token specified in request";
      console.warn(msg);
      reject(new Error(msg));
    }
  });
};

export const getIssuer = (event: any) => {
  const host = event.headers.host || event.requestContext?.domainName;
  const stage = event.requestContext?.stage;

  if (!stage || stage === "$default") {
    return host;
  } else {
    return `${host}/${stage}`;
  }
};
