import amqplib from 'amqplib'
import {getCachedRedisClient, initRabbitConnection, getCachedSSMClient} from '@manga-naya/cache'
import listenToQueue from './src/rabbit'
import scrapeQuery from './src/scrapeQuery'

const node_env = process.env.NODE_ENV

const config = await (node_env === 'development' ? Promise.resolve({
  MAX: Number(process.env.MAX_REQUESTS),
  DELAY: Number(process.env.DELAY)
}) : (async() => {
  const ssm = await getCachedSSMClient()
  return {
    // MAX: await Number(ssm.getParameter('manganaya-scraper-max')),
    // DELAY: await Number(ssm.getParameter('manganaya-scraper-delay'))
    MAX: 5,
    DELAY: 1000
  }
})())

const {MAX, DELAY} = config

if (!MAX || !DELAY) {
  throw new Error('Failed to get environment')
}

// The queue to request the thumbnails
const extractorQueue = 'thumbnail'
// The queue to request more data from the scraper
const scraperQueue = 'scraper'

// Connect to RabbitMQ
initRabbitConnection().then(async (connection) => {
  const channel = await connection.createChannel()

  const searchHandler = async (query: string) => {
    // search
    console.log(` [*] Searching for ${query}`)
    if (!query) {
      return
    }
    await scrapeQuery(channel, extractorQueue, DELAY, query)
    const redisClient = await getCachedRedisClient()
    await redisClient.del(`s-${query}`)
  }

  // Listen to the scraper queue
  const closeChannel = await listenToQueue(channel, scraperQueue, MAX, searchHandler)

  const exit = () => {
    console.log(' [*] Exiting')
    closeChannel().then(() => {
      connection.close()
    })
  }

  process.on('SIGINT', exit)
  process.on('SIGKILL', exit)
  process.on('SIGTERM', exit)
  process.on('exit', exit)
}).catch((error) => {
  throw new Error(`Failed to connect to RabbitMQ: ${error}`)
})