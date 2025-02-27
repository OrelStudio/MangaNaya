import {
  getMangas,
  getManga,
  getChapters,
  // getPanels,
  getMangasPages,
  insertHistory,
} from '../db'

import type {Context} from 'hono'
import {getRedisClient} from '@manga-naya/cache'

import APIError from '../Errors'

import searchQuery from '../controllers/search'
import getChapter from '../controllers/chapter'

import type {PageType, MangaQL, ChaptersQL, ChapterResultsType, ChapterTypeDB} from '@manga-naya/types'

const redisClient = await getRedisClient()

process.on('SIGINT', redisClient.close)
process.on('SIGKILL', redisClient.close)
process.on('SIGTERM', redisClient.close)
process.on('exit', redisClient.close)

const omit = <T>(obj: T, keys: (keyof T)[]) => {
  const result = {...obj}
  for (const key of keys) {
    delete result[key]
  }
  return result
}

const chapter = async ({id}: {id: number}, c: Context): Promise<ChaptersQL> => {
  try {
    const user = await c.get('user')
    const {chapter, manga} = await getChapter(id, user.id, redisClient.client)
    const safeChapter = omit(chapter, ['chapter_link', 'source'])

    // Add the chapter to user's history
    await insertHistory(user.id, id, manga.id)

    return {
      ...safeChapter,
      manga_name: manga.name,
    }
  } catch (error) {
    throw new APIError('Requested', 202)
  }
}

const chapters = async (mangaId: number, userId: number): Promise<ChapterTypeDB[]> => {
  try {
    const chapters = await getChapters(mangaId, userId)
    return chapters.map(chapter => omit(chapter, ['chapter_link', 'source']))
  } catch (error) {
    throw new APIError('Error', 500)
  }
}

const manga = async ({id}: {id: number}, c: Context): Promise<MangaQL> => {
  if (!id) {
    throw new APIError('Error', 400)
  }
  try {
    const user = await c.get('user')
    const mangaResult = await getManga(id, user.id)
    return {
      ...mangaResult,
      chapters: async () => await chapters(id, user.id)
    }
  } catch (error) {
    throw new APIError('Error', 500)
  }
}

const search = async ({query}: {query: string}, c: Context): Promise<MangaQL[]> => {
  try {
    const user = await c.get('user')
    const mangas = await searchQuery(query, user.id, redisClient.client)
    return mangas.map((manga) => ({
      ...manga,
      chapters: async (): Promise<ChapterTypeDB[]> => await chapters(manga.id, user.id)
    }))
  } catch (error: any) {
    if (error.message.includes('empty')) {
      throw new APIError('empty', 202)
    } else {
      throw new APIError('Requested', 202)
    }
  }
}

const page = async ({page}: {page: number}, c: Context): Promise<PageType> => {
  try {
    const user = await c.get('user')
    const lastPage = await getMangasPages()
    const mangas = await getMangas(page, user.id)

    const res = mangas.map(manga => ({
      ...manga,
      chapters: async () => await chapters(manga.id, user.id)
    }))

    return {lastPage: lastPage, mangas: res}
  } catch (error) {
    console.error('Error:', error)
    throw new APIError('Error', 500)
  }
}

export {
  manga,
  page,
  search,
  chapter,
  chapters
}