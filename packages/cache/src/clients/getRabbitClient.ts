import amqplib from 'amqplib'
import getSSMClient from './getSSMClient'

import type {ClientObject} from '../types'

let connectionState: amqplib.Connection

const getPassword = async (): Promise<string> => {
  const node_env = process.env.NODE_ENV

  if (node_env === 'development') {
    if (!process.env.RABBITMQ_PASSWORD) {
      throw new Error('RabbitMQ URL not found')
    }
    return process.env.RABBITMQ_PASSWORD
  }

  const ssm = await getSSMClient()
  const password = await ssm.client.getSecureParameter('manganaya-rabbitmq-password')

  if (typeof password !== 'string') {
    throw new Error('Failed to get the RabbitMQ URL')
  }

  await ssm.close()

  return password
}

const initRabbitConnection = async (): Promise<amqplib.Connection> => {
  const password = await getPassword()
  // const connection = await amqplib.connect({
  //   hostname: 'amqp://rabbitmq', // this is the name of the service in the docker-compose file
  //   port: 5672,
  //   protocol: 'amqp',
  //   heartbeat: 60,
  //   username: 'guest',
  //   password: password
  // })
  const connection = await amqplib.connect(`amqp://guest:guest@rabbitmq:5672`)
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