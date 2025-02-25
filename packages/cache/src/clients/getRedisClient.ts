import {createClient} from 'redis'
import getSSMClient from './getSSMClient'

import type {ClientObject, RedisType} from '../types'

const getUrl = async (): Promise<{url: string, password: string}> => {
  const node_env = process.env.NODE_ENV

  if (node_env === 'development') {
    // if (!process.env.redis_url) {
    //   throw new Error('redis URL not found')
    // }
    console.log('Using development config')
    
    return {
      url: 'redis://localhost:6379',
      password: ''
    }
  }

  const ssm = await getSSMClient()
  const url = await ssm.client.getParameter('manganaya-redis-url')
  const password = await ssm.client.getSecureParameter('manganaya-redis-password')

  if (typeof url !== 'string' || typeof password !== 'string') {
    throw new Error('Failed to get the redis URL')
  }

  await ssm.close()

  return {
    url,
    password
  }
}

const getRedisClient = async(): Promise<ClientObject<RedisType>> => {
  console.log('Creating new Redis client')
  const {url, password} = await getUrl()

  const redisClient = createClient({url: url, password: password})
  redisClient.on('error', (err) => {
    console.error(`Failed to connect to Redis: ${err} url: ${url}`)
  })
  await redisClient.connect()
  console.log('Connected to Redis')

  redisClient.on('error', (err) => {
    console.error(`Redis error: ${err}`)
  })

  return {
    client: redisClient as RedisType,
    close: async () => {
      console.log('Closing Redis client')
      await redisClient.quit()
    }
  }
}

export default getRedisClient