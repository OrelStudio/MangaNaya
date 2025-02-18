import {SSMClient, GetParameterCommand} from '@aws-sdk/client-ssm'

import type {ClientObject, SSMClientType} from '../types'

const getSSMClient = async(): Promise<ClientObject<SSMClientType>> => {
  const client = new SSMClient({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  const getParameter = async(parameterName: string) => {
    const response = await client.send(
      new GetParameterCommand({
        Name: parameterName
      })
    )

    return response.Parameter?.Value
  }

  const getSecureParameter = async(parameterName: string) => {
    const response = await client.send(
      new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true
      })
    )

    return response.Parameter?.Value
  }

  return {
    client: {
      config: client.config,
      send: client.send,
      destroy: client.destroy,
      middlewareStack: client.middlewareStack,
      getParameter,
      getSecureParameter
    },
    close: async() => {
      client.destroy()
    }
  }
}

export default getSSMClient