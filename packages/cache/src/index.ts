import {createCache} from 'celli'
import {Client as PgClient} from 'pg'
import amqplib from 'amqplib'
import {S3Client} from '@aws-sdk/client-s3'

import getDBClient from './clients/getDBClient'
import getRedisClient from './clients/getRedisClient'
import {getRabbitClient, initRabbitConnection} from './clients/getRabbitClient'
import getSSMClient from './clients/getSSMClient'
import getS3Client from './clients/getS3Client'

import type {
  ClientObject,
  RedisType,
  SecretsManagerClientType,
  SSMClientType
} from './types'

const clients = {
  db: getDBClient,
  redis: getRedisClient,
  rabbitmq: getRabbitClient,
  ssm: getSSMClient,
  s3: getS3Client
}

type ClientType = keyof typeof clients
type ClientsTypes = PgClient | RedisType | amqplib.Channel | SecretsManagerClientType | SSMClientType | S3Client
type ClientValue = ClientObject<ClientsTypes>

// Create a cache for clients with TTL and a dispose function:
const clientsCache = createCache<ClientType, ClientValue>({
  async: true,
  ttl: 300_000, // 5 minutes
  // ttl: 5000, // 5 seconds
  lru: 100,
  dispose: async (clientObj) => {
    console.log(`Disposing ${clientObj.client}`);
    await clientObj.close()
  }
})

/**
 * Retrieve a cached client (db or redis).
 * If it's not in the cache, create a new one and store it.
 *
 * @param type The type of client to retrieve ('db' or 'redis')
 */
const getCachedClient = async(type: ClientType): Promise<ClientsTypes> => {
  const cached = await clientsCache.get(type)
  if (cached) return cached.client

  const createFn: () => Promise<ClientValue> = clients[type]

  const newClientObj = await createFn()
  console.log(`Created new ${type} client`)
  await clientsCache.set(type, newClientObj)
  console.log(`log ${newClientObj}`)
  
  return newClientObj.client
}

const getCachedDBClient = async (): Promise<PgClient> => {
  return await getCachedClient('db') as PgClient
}

const getCachedRedisClient = async (): Promise<RedisType> => {
  return await getCachedClient('redis') as RedisType
}

const getCachedRabbitClient = async (): Promise<amqplib.Channel> => {
  return await getCachedClient('rabbitmq') as amqplib.Channel
}

const getCachedSSMClient = async (): Promise<SSMClientType> => {
  return await getCachedClient('ssm') as SSMClientType
}

const getCachedS3Client = async (): Promise<S3Client> => {
  return await getCachedClient('s3') as S3Client
}

export {
  getCachedDBClient,

  getCachedRedisClient,
  getRedisClient,

  getCachedSSMClient,

  getCachedRabbitClient,
  getRabbitClient,
  initRabbitConnection,

  getCachedS3Client
}
export type {
  RedisType
}