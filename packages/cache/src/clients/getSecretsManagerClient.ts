import {
  SecretsManagerClient,
  GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager'

import type {ClientObject, SecretsManagerClientType} from '../types'

const getSecretsManagerClient = async(): Promise<ClientObject<SecretsManagerClientType>> => {
  const client = new SecretsManagerClient({region: 'us-west-2'}) // TODO: get from config

  const getSecretValue = async(secretName: string) => {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName
      })
    )

    return response.SecretString || response.SecretBinary
  }
  // client.
  return {
    client: {
      getSecretValue,
      destroy: client.destroy,
      send: client.send,
      config: client.config,
      middlewareStack: client.middlewareStack
    },
    close: async() => {
      client.destroy()
    }
  }
}

export default getSecretsManagerClient

// console.log(response);
// {
//   '$metadata': {
//     httpStatusCode: 200,
//     requestId: '584eb612-f8b0-48c9-855e-6d246461b604',
//     extendedRequestId: undefined,
//     cfId: undefined,
//     attempts: 1,
//     totalRetryDelay: 0
//   },
//   ARN: 'arn:aws:secretsmanager:us-east-1:xxxxxxxxxxxx:secret:binary-secret-3873048-xxxxxx',
//   CreatedDate: 2023-08-08T19:29:51.294Z,
//   Name: 'binary-secret-3873048',
//   SecretBinary: Uint8Array(11) [
//      98, 105, 110, 97, 114,
//     121,  32, 100, 97, 116,
//      97
//   ],
//   VersionId: '712083f4-0d26-415e-8044-16735142cd6a',
//   VersionStages: [ 'AWSCURRENT' ]
// }