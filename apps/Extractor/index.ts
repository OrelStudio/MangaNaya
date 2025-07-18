import amqplib from 'amqplib'
import {getCachedRedisClient, initRabbitConnection, getCachedSSMClient, getRedisClient} from '@manga-naya/cache'
import listenToQueue from './src/rabbit'
import downloadChapter from './src/downloadChapter'
import downloadThumbnail from './src/downloadThumbnail'

import type {RedisType} from '@manga-naya/cache'
import {SourceType} from '@manga-naya/types'

const node_env = process.env.NODE_ENV

type ExtractRequestType = {
  source: SourceType
  index: number
  link: string
  name: string
}

type ThumbnailRequestType = {
  source: SourceType
  name: string
  thumbnailLink: string
  linkToManga: string
}

// Removes the key from the cache
const updateState = async (redisClient: RedisType, key: string) => {
  await redisClient.del(key)
}

const config = await (node_env === 'development' ? Promise.resolve({
  MAX_CHAPTERS: Number(process.env.MAX_CHAPTERS),
  MAX_THUMBNAILS: Number(process.env.MAX_THUMBNAILS)
}) : (async() => {
  const ssm = await getCachedSSMClient()
  return {
    MAX_CHAPTERS: Number(await ssm.getParameter('manganaya-extractor-max-chapters')),
    MAX_THUMBNAILS: Number(await ssm.getParameter('manganaya-extractor-max-thumbnails'))
  }
})())

const {MAX_CHAPTERS, MAX_THUMBNAILS} = config

const chaptersQueue = 'chapter'
const thumbnailsQueue = 'thumbnail'
if (!MAX_CHAPTERS || !MAX_THUMBNAILS) {
  throw new Error('ENV is not set')
}

const redisClient = await getRedisClient()

const chapterHandler = async(query: ExtractRequestType) => {
  try {
    console.log(`Received request for chapter ${query.index} of ${query.name}`)
    await downloadChapter({source: query.source, index: query.index, link: query.link, name: query.name})
  } catch (error) {
    console.error(`Failed to download chapter ${query.index} of ${query.name}`, error)
  } finally {
    await updateState(redisClient.client, `c-${query.name}-${query.index}`)
  }
}

const thumbnailHandler = async(query: ThumbnailRequestType) => {
  try {
    await downloadThumbnail(query.thumbnailLink, query.name, query.linkToManga)
  } catch (error) {
    console.error(`Failed to download thumbnail for ${query.name}`, error)
  } finally {
    await updateState(redisClient.client, `s-${query.name}`)
  }
}

initRabbitConnection().then(async (connection) => {
  const channel = await connection.createChannel()

  const closeChapterChannel = await listenToQueue<ExtractRequestType>(channel, chaptersQueue, MAX_CHAPTERS, chapterHandler)
  const closeThumbnailChannel = await listenToQueue<ThumbnailRequestType>(channel, thumbnailsQueue, MAX_THUMBNAILS, thumbnailHandler)

  const exit = async () => {
    console.log(' [*] Exiting')
    await closeChapterChannel()
    await closeThumbnailChannel()
    await redisClient.close()
    await connection.close()
  }

  process.on('SIGINT', exit)
  process.on('SIGKILL', exit)
  process.on('SIGTERM', exit)
  process.on('exit', exit)
}).catch(error => {
  console.error('Failed to connect to RabbitMQ', error)
})