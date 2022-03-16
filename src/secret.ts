import { SecretsManager } from "aws-sdk"
import { secretName } from "./consts"

const secrets = new SecretsManager()

export const getSecrets = () => {
  return new Promise((resolve) => {
    secrets.getSecretValue({ SecretId: secretName }, (err, data) => {
      if (err) {
        console.error(`Error fetching secret ${secretName}`, err)
        throw err
      }
      const secrets = JSON.parse(data.SecretString || "{}")
      resolve(secrets)
    })
  })
}
