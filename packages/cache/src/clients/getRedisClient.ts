import {createClient} from 'redis'
import getSSMClient from './getSSMClient'

import type {ClientObject, RedisType} from '../types'

const getRedisClient = async(): Promise<ClientObject<RedisType>> => {
  console.log('Creating new Redis client')
  const url = 'redis://redis:6379' // this is the name of the service in the docker-compose file

  const redisClient = createClient({url: url})
  redisClient.on('error', (err) => {
    console.error(`Failed to connect to Redis: ${err}`)
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