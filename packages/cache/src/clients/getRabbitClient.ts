import amqplib from 'amqplib'
import getSSMClient from './getSSMClient'

import type {ClientObject} from '../types'

let connectionState: amqplib.Connection

const getConfig = async (): Promise<{url: string, password: string, port: number}> => {
  const node_env = process.env.NODE_ENV

  if (node_env === 'development') {
    if (!process.env.RABBITMQ_PASSWORD || !process.env.RABBITMQ_URL) {
      throw new Error('RabbitMQ URL not found')
    }
    console.log('Using development config')
    
    return {
      url: process.env.RABBITMQ_URL,
      password: process.env.RABBITMQ_PASSWORD,
      port: 5672
    }
  }

  const ssm = await getSSMClient()
  const password = await ssm.client.getSecureParameter('manganaya-rabbitmq-password')
  const url = await ssm.client.getParameter('manganaya-rabbitmq-url')

  if (typeof password !== 'string' || typeof url !== 'string') {
    throw new Error('Failed to get the RabbitMQ URL')
  }

  await ssm.close()

  return {
    url,
    password,
    port: 5671
  }
}

const initRabbitConnection = async (): Promise<amqplib.Connection> => {
  const {url, password, port} = await getConfig()
  const connection = await amqplib.connect({
    hostname: url,
    port: port,
    protocol: 'amqp',
    heartbeat: 60,
    username: 'manganayamq',
    password: password
  })
  // const connection = await amqplib.connect(`amqp://manganayamq:${password}@rabbitmq:5672`)
  console.log(`Connected to RabbitMQ at ${url}:${port}`)
  connectionState = connection
  return connection
}

const getRabbitClient = async (): Promise<ClientObject<amqplib.Channel>> => {
  if (!connectionState) {
    await initRabbitConnection()
  }
  const channel = await connectionState.createChannel()

  return {
    client: channel,
    close: async () => {
      await channel.close()
      // connection.close()
    }
  }
}

export {
  initRabbitConnection,
  getRabbitClient
}