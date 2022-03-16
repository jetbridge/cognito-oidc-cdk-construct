import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { secretName } from "./consts";

export const getSecrets = async () => {
  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretName });
  const res = await client.send(req);
  if (!res.SecretString) {
    throw new Error(`Missing secretString in ${secretName}`);
  }
  return JSON.parse(res.SecretString);
};
