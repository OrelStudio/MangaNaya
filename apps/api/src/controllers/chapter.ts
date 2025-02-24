import amqplib from 'amqplib'
import {getCachedRedisClient, getCachedRabbitClient} from '@manga-naya/cache'
import {getChapter as chapter, getManga} from '../db'
import type {ChapterTypeDB, MangaTypeDB} from '@manga-naya/types'

import APIError from '../Errors'

const chapterQueue = 'chapter'

const requestChapter = (
  channel: amqplib.Channel,
  source: string,
  index: number,
  link: string,
  name: string
) => {
  const message = JSON.stringify({source, index, link, name})

  channel.sendToQueue(chapterQueue, Buffer.from(message), {
    persistent: true
  })
}

const getChapter = async (id: number, userId: number): Promise<{chapter: ChapterTypeDB, manga: MangaTypeDB}> => {
  try {
    const requestedChapter = await chapter(id, userId)
    
    if (!requestedChapter) {
      throw new APIError('Error', 404)
    }
    const manga = await getManga(requestedChapter.manga_id, userId)
    if (!manga) {
      throw new APIError('Error', 404)
    }
    const redisClient = await getCachedRedisClient()
    const cache = await redisClient.get(`c-${manga.name}-${requestedChapter.chapter_number}`)

    // if there chapter is not available, request it and save it to the cache if it's not already there
    // either way, return a 202 status code because the chapter is not available
    if (!requestedChapter.available) {
      if (!cache) {
        const channel = await getCachedRabbitClient()
        console.log(`Requesting chapter ${requestedChapter.chapter_number} for ${manga.name}`)
        requestChapter(channel, requestedChapter.source, requestedChapter.chapter_number, requestedChapter.chapter_link, manga.name)
      }
      throw new APIError('Requested', 202)
    }

    // The chapter is available, return it
    return {chapter: requestedChapter, manga: manga}
  } catch (error) {
    throw new APIError('Error', 500)
  }
}

export default getChapter