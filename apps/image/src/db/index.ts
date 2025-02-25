import {getDBClient} from '@manga-naya/cache'

const dbClient = await getDBClient()

const getCachedDBClient = async () => {
  return dbClient.client
}

process.on('SIGINT', dbClient.close)
process.on('SIGKILL', dbClient.close)
process.on('SIGTERM', dbClient.close)
process.on('exit', dbClient.close)

import type {
  MangaTypeDB,
  ChapterTypeDB,
  PanelTypeDB
} from '@manga-naya/types'

const getCleanName = (name: string): string => name.replace(/[\/\\:*?"&<>|]/g, '_')

const getManga = async (id: number): Promise<MangaTypeDB> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`
      SELECT * FROM manga
      WHERE id = $1
    `, [id])

    return res.rows[0]
  } catch (err) {
    console.error('Error getting manga:', err)
    throw new Error('Failed to get manga')
  }
}

const getChapter = async (id: number): Promise<ChapterTypeDB> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`
      SELECT * FROM chapter
      WHERE id = $1
    `, [id])

    return res.rows[0]
  } catch (err) {
    console.error('Error getting chapter:', err)
    throw new Error('Failed to get chapter')
  }
}

const getPanel = async (chapterId: number, index: number): Promise<PanelTypeDB> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`
      SELECT * FROM panel
      WHERE chapter_id = $1 AND index = $2
    `, [chapterId, index])

    return res.rows[0]
  } catch (err) {
    console.error('Error getting panel:', err)
    throw new Error('Failed to get panel')
  }
}

export {
  getManga,
  getChapter,
  getPanel,
  getCleanName,
}