import type {MangaQL, ChapterTypeDB} from '@manga-naya/types'
import {
  getUser,
  removeUser,
  
  getHistory,
  insertHistory,
  removeHistory,

  getReadingList,
  toggleReading,

  getFavorites,
  toggleFav,
  getStats,
  getForYouPage,

  getChapter,
  getManga
} from '../db'
import {chapters} from './manga'
import APIError from '../Errors'


type Favorites = {
  id: number
  user_id: number
  manga: () => Promise<MangaQL>
}

type ReadingList = {
  id: number
  user_id: number
  chapter_number: number
  manga: () => Promise<MangaQL>
}

type History = {
  id: number
  user_id: number
  chapter: () => Promise<ChapterTypeDB>
}

type User = {
  id: number
  name: string
  email: string
  history: () => Promise<History[]>
  readingList: () => Promise<ReadingList[]>
  favorites: () => Promise<Favorites[]>
}

type StatsType = {
  total_manga_read: number
  total_chapters_read: number
  top_genre: string[] | null
  top_manga: () => Promise<MangaQL[]>
  last_4_chapter_reads: () => Promise<ChapterTypeDB[]>
  reading_streak: number
}

type ForYou = {
  recommendations: () => Promise<MangaQL[]>
  popular: () => Promise<MangaQL[]>
  genres: () => {
    genre: string
    mangas: () => Promise<MangaQL[]>
  }[],
  leftoff_manga: () => Promise<MangaQL[]>
}

const omit = <T>(obj: T, keys: (keyof T)[]) => {
  const result = {...obj}
  for (const key of keys) {
    delete result[key]
  }
  return result
}

const manga = async(id: number, userId: number): Promise<MangaQL> => {
  try {
    const mangaResult = await getManga(id, userId)
    return {
      ...mangaResult,
      chapters: async () => await chapters(id, userId)
    }
  } catch (error) {
    throw new APIError('Error', 500)
  }
}

const favorites = async ({userId}: {userId: number}): Promise<Favorites[]> => {
  const userFavorites = await getFavorites(userId)
  return userFavorites.map((favorite) => ({
    ...favorite,
    manga: async () => await manga(favorite.manga_id, userId)
  }))
}

const readingList = async ({userId}: {userId: number}): Promise<ReadingList[]> => {
  const userReadingList = await getReadingList(userId)
  return userReadingList.map((reading) => ({
    ...reading,
    manga: async () => await manga(reading.manga_id, userId)
  }))
}

const history = async (userId: number): Promise<History[]> => {
  const userHistory = await getHistory(userId)
  return userHistory.map((history) => ({
    ...history,
    chapter: async() => await getChapter(history.chapter_id, userId)
  }))
}

const user = async ({email}: {email: string}): Promise<User> => {
  const userResult = await getUser(email)
  return {
    ...userResult,
    history: async() => await history(userResult.id),
    readingList: async() => await readingList({userId: userResult.id}),
    favorites: async() => await favorites({userId: userResult.id})
  }
}

const stats = async({userId}: {userId: number}): Promise<StatsType> => {
  if (!userId) throw new APIError('Error', 404)
  const userStats = await getStats(userId)

  const res: StatsType = {
    ...userStats,
    top_manga: async() => {
      const topMangaIds = userStats.top_manga
      if (!topMangaIds) return []
      return Promise.all(topMangaIds.map(async (mangaId) => await manga(mangaId, userId)))
    },
    last_4_chapter_reads: async() => {
      const last4ChapterIds = userStats.last_4_chapter_reads
      return Promise.all(last4ChapterIds.map(async (chapterId) => {
        const chapter = await getChapter(chapterId, userId)
        return omit(chapter, ['chapter_link', 'source'])
      }))
    }
  }

  return res
}

const foryou = async({userId}: {userId: number}): Promise<ForYou> => {
  if (!userId) throw new APIError('Error', 404)
  const rawforyou = await getForYouPage(userId)

  const res: ForYou = {
    recommendations: async() => {
      const mangaPromises = rawforyou.recommended_manga.map((mangaId) => manga(mangaId, userId))
      return Promise.all(mangaPromises)
    },
    popular: async() => {
      const mangaPromises = rawforyou.popular_manga.map((mangaId) => manga(mangaId, userId))
      return Promise.all(mangaPromises)
    },
    genres: () => rawforyou.genres.map((genre) => ({
      genre: genre.genre,
      mangas: async() => {
        if (!genre.manga) return []
        const mangaPromises = genre.manga.map((mangaId) => manga(mangaId, userId))
        return Promise.all(mangaPromises)
      }
    })),
    leftoff_manga: async() => {
      const mangaPromises = rawforyou.leftoff_manga.map((mangaId) => manga(mangaId, userId))
      return Promise.all(mangaPromises)
    }
  }

  return res
}

const deleteUser = async({email}: {email: string}): Promise<string> => {
  await removeUser(email)
  return 'DELETED'
}

const addHistory = async({userId, chapterId, mangaId}: {userId: number, chapterId: number, mangaId: number}): Promise<string> => {
  await insertHistory(userId, chapterId, mangaId)
  return 'ADDED TO HISTORY'
}

const deleteHistory = async({historyId}: {historyId: number}): Promise<string> => {
  await removeHistory(historyId)
  return 'REMOVED FROM HISTORY'
}

const toggleReadingList = async({userId, mangaId}: {userId: number, mangaId: number}): Promise<string> => {
  await toggleReading(userId, mangaId)
  return 'ADDED TO READING LIST'
}

const toggleFavorites = async({userId, mangaId}: {userId: number, mangaId: number}): Promise<string> => {
  await toggleFav(userId, mangaId)
  return 'ADDED TO FAVORITES'
}


export {
  user,
  deleteUser,
  favorites,
  readingList,
  history,

  addHistory,
  deleteHistory,

  toggleReadingList,
  toggleFavorites,
  stats,
  foryou
}