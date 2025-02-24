import axios from 'axios'
import {getCachedDBClient} from '@manga-naya/cache'

import type {
  UserResultType,
  UserType,
  HistoryType,
  ReadingListType,
  FavoritesType,
  MangaTypeDB,
  ChapterResultsType,
  ChapterTypeDB,
  PanelTypeDB
} from '@manga-naya/types'

// const imageServiceUrl = process.env.NODE_ENV === 'development' ? 'http://image:8000' : (async () => {
//   const ssm = await getCachedSSMClient()
//   return await ssm.getParameter('manganaya-image-service-url')
// })()

const imageServiceUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://img.manganaya.com'

const getThumbnail = async (mangaId: number): Promise<string> => {
  return `${imageServiceUrl}/thumbnail/${mangaId}` // web request to that will return the image
}

const getMangas = async (page: number, userId: number): Promise<MangaTypeDB[]> => {
  try {
    const client = await getCachedDBClient()
    
    const res = await client.query(`
      SELECT
        m.*,
        CASE WHEN f.manga_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isFav",
        CASE WHEN r.manga_id IS NOT NULL THEN TRUE ELSE FALSE END AS "inReadingList"
      FROM manga m
      LEFT JOIN favorites f
        ON m.id = f.manga_id
        AND f.user_id = $2
      LEFT JOIN reading_list r
        ON m.id = r.manga_id
        AND r.user_id = $2
      ORDER BY m.id
      LIMIT 12
      OFFSET $1
    `, [page * 10, userId])

    const result = await Promise.all(res.rows.map(async (manga) => ({
      ...manga,
      thumbnail: await getThumbnail(manga.id),
    })))

    console.log('get mangas browse:', result)

    return result
  } catch (err) {
    console.error('Error getting mangas:', err)
    throw new Error('Failed to get mangas')
  }
}

const getManga = async (id: number, userId: number): Promise<MangaTypeDB> => {
  try {
    const client = await getCachedDBClient()
    
    const res = await client.query(`
      SELECT
        m.*,
        CASE WHEN f.manga_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isFav",
        CASE WHEN r.manga_id IS NOT NULL THEN TRUE ELSE FALSE END AS "inReadingList"
      FROM manga m
      LEFT JOIN favorites f
        ON m.id = f.manga_id
        AND f.user_id = $2
      LEFT JOIN reading_list r
        ON m.id = r.manga_id
        AND r.user_id = $2
      WHERE m.id = $1
    `, [id, userId])

    if (res.rows.length === 0) {
      throw new Error('Manga not found')
    }

    const manga = {
      ...res.rows[0],
      thumbnail: await getThumbnail(id),
    }

    return manga
  } catch (err) {
    console.error('Error getting manga:', err)
    throw new Error('Failed to get manga')
  }
}

const searchManga = async (query: string, userId: number): Promise<MangaTypeDB[]> => {
  try {
    const client = await getCachedDBClient()
    
    const res = await client.query(`
      SELECT
        m.*,
        CASE WHEN f.manga_id IS NOT NULL THEN TRUE ELSE FALSE END AS "isFav",
        CASE WHEN r.manga_id IS NOT NULL THEN TRUE ELSE FALSE END AS "inReadingList"
      FROM manga m
      LEFT JOIN favorites f
        ON m.id = f.manga_id
        AND f.user_id = $2
      LEFT JOIN reading_list r
        ON m.id = r.manga_id
        AND r.user_id = $2
      WHERE m.name ILIKE $1
    `, [`%${query}%`, userId])

    const result = await Promise.all(res.rows.map(async (manga) => ({
      ...manga,
      thumbnail: await getThumbnail(manga.id),
    })))

    return result
  } catch (err) {
    console.error('Error searching manga:', err)
    throw new Error('Failed to search manga')
  }
}

const removeDuplicates = (chapters: ChapterTypeDB[]): ChapterTypeDB[] => {
  const seen = new Set()
  return chapters.filter((chapter) => {
    if (seen.has(chapter.chapter_number)) {
      return false
    }
    seen.add(chapter.chapter_number)
    return true
  })
}

const getChapters = async (
  mangaId: number,
  userId: number
): Promise<ChapterTypeDB[]> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`
      SELECT
        c.*,
        m.name AS "mangaName",
        CASE WHEN h.chapter_id IS NOT NULL THEN TRUE ELSE FALSE END AS read,
        CASE WHEN h.chapter_id IS NOT NULL THEN h.created_at ELSE NULL END AS created_at
      FROM chapter c
      JOIN manga m 
        ON c.manga_id = m.id
      LEFT JOIN history h
        ON c.id = h.chapter_id
      AND h.user_id = $2
      WHERE c.manga_id = $1
      ORDER BY c.chapter_number
    `, [mangaId, userId])
    
    const rows = removeDuplicates(res.rows)
    const result = await Promise.all(rows.map(async (chapter) => ({
      ...chapter,
      thumbnail: await getThumbnail(mangaId),
    })))

    return result
  } catch (err) {
    console.error('Error getting chapters:', err)
    throw new Error('Failed to get chapters')
  }
}

const getChapter = async (id: number, userId: number): Promise<ChapterTypeDB> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`
      SELECT
        c.*,
        m.name AS "mangaName",
        CASE WHEN h.chapter_id IS NOT NULL THEN TRUE ELSE FALSE END AS read,
        CASE WHEN h.chapter_id IS NOT NULL THEN h.created_at ELSE NULL END AS created_at
      FROM chapter c
      JOIN manga m
        ON c.manga_id = m.id
      LEFT JOIN history h
        ON c.id = h.chapter_id
        AND h.user_id = $2
      WHERE c.id = $1
    `, [id, userId])

    return {
      ...res.rows[0],
      thumbnail: await getThumbnail(res.rows[0].manga_id),
    }
  } catch (err) {
    console.error('Error getting chapter:', err)
    throw new Error('Failed to get chapter')
  }
}

// return the number of pages
const getMangasPages = async (): Promise<number> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT COUNT(*) FROM manga`)
    return Math.round(res.rows[0].count / 10)
  } catch (err) {
    console.error('Error getting mangas pages:', err)
    throw new Error('Failed to get mangas pages')
  }
}

export {
  getMangas,
  getManga,
  searchManga,
  getChapters,
  getChapter,
  // getPanels,
  getMangasPages
}