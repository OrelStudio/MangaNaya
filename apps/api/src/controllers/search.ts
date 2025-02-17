import amqplib from 'amqplib'
import {getCachedRedisClient, getCachedRabbitClient} from '@manga-naya/cache'
import {searchManga} from '../db'

import APIError from '../Errors'

import type {MangaTypeDB} from '@manga-naya/types'

const searchQueue = 'scraper'

const requestScrape = (channel: amqplib.Channel, query: string) => {
  const message = JSON.stringify({query})

  console.log(` [x] Requesting scrape for ${query}`);
  channel.sendToQueue(searchQueue, Buffer.from(message), {
    persistent: true
  })
}

const searchQuery = async (query: string, userId: number): Promise<MangaTypeDB[]> => {
  if (!query) {
    throw new Error('Query is empty')
  }
  console.log(`Received search query:`, query)
  const mangas = await searchManga(query, userId)

  const redisClient = await getCachedRedisClient()
  const cache = await redisClient.get(`s-${query}`)

  console.log(`Cache: ${cache}`)
  

  if (cache === null) {
    // Request the scraper to search for more mangas  
    const channel = await getCachedRabbitClient()
    
    requestScrape(channel, query)
    // Update the cache
    try {
      await redisClient.set(`s-${query}`, 'true')
    } catch (error) {
      throw new APIError((`Failed to set cache: ${error}`), 500)
    }
  }

  // whether the cache is set or not, if the mangas are empty, we throw an error
  if (mangas.length === 0) {
    throw new APIError('requested', 202)
  }

  return mangas
}

export default searchQuery