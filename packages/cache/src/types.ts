import {
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'
import {SSMClient} from '@aws-sdk/client-ssm'
import type {RedisClientType, RedisDefaultModules} from 'redis'

interface ClientObject<T> {
  client: T
  close: () => Promise<void>
}

type RedisType = RedisClientType<RedisDefaultModules>

type SecretsManagerClientType = SecretsManagerClient & {
  getSecretValue: (secretName: string) => Promise<string | Uint8Array | undefined>
}

type SSMClientType = SSMClient & {
  getParameter: (parameterName: string) => Promise<string | undefined>
  getSecureParameter: (parameterName: string) => Promise<string | undefined>
}

export type {
  ClientObject,
  RedisType,
  SecretsManagerClientType,
  SSMClientType
}