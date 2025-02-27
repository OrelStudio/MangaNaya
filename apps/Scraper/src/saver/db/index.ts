import {getDBClient} from '@manga-naya/cache'

const dbClient = await getDBClient()

const getCachedDBClient = async () => {
  return dbClient.client
}

process.on('SIGINT', dbClient.close)
process.on('SIGKILL', dbClient.close)
process.on('SIGTERM', dbClient.close)
process.on('exit', dbClient.close)

// Initialize the database
// await client.query(`CREATE TABLE IF NOT EXISTS manga (
//   id SERIAL PRIMARY KEY,
//   name TEXT NOT NULL UNIQUE,
//   thumbnail TEXT,
//   genres TEXT[]
//   description TEXT
// )`)
// await client.query(`CREATE TABLE IF NOT EXISTS chapter (
//   id SERIAL PRIMARY KEY,
//   manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
//   chapter_number REAL NOT NULL,
//   chapter_link TEXT NOT NULL,
//   available BOOLEAN DEFAULT FALSE,
//   length INTEGER NOT NULL,
//   UNIQUE(manga_id, chapter_number)
// )`)

const isMangaExists = async (name: string): Promise<boolean> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT * FROM manga WHERE name = $1`, [name])
    return res.rows.length > 0
  } catch (err) {
    console.error('Error checking manga:', err)
    return false
  }
}

const isChapterExists = async (mangaName: string, chapterNumber: number): Promise<boolean> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`
      SELECT chapter_number 
      FROM chapter 
      INNER JOIN manga ON chapter.manga_id = manga.id
      WHERE manga.name = $1 AND chapter.chapter_number = $2
    `, [mangaName, chapterNumber])

    return res.rows.length > 0
  } catch (err) {
    console.error('Error checking chapter:', err)
    return false
  }
}

const insertManga = async (name: string): Promise<void> => {
  try {
    const doesExist = await isMangaExists(name)
    if (doesExist) {
      console.log(`Manga with name '${name}' already exists`)
      return
    }
    const client = await getCachedDBClient()
    // Inserting with genres and description be empty
    await client.query(`INSERT INTO manga (name, thumbnail, genres, description) VALUES ($1, $2, $3, $4)`, [name, '', [], ''])
  } catch (err) {
    console.error('Error inserting manga:', err)
    throw new Error('Failed to insert manga')
  }
}

const updateManga = async (name: string, genres: string[], description: string): Promise<void> => {
  try {
    const client = await getCachedDBClient()

    if (genres.length) {
      // Update genres based on the manga name
      await client.query(`UPDATE manga SET genres = $1 WHERE name = $2`, [genres, name])
    }

    if (description) {
      // Update description based on the manga name
      await client.query(`UPDATE manga SET description = $1 WHERE name = $2`, [description, name])
    }
  } catch (err) {
    console.error('Error updating manga:', err)
    throw new Error('Failed to update manga')
  }
}

const insertChapter = async (mangaName: string, chapterNumber: number, chapterLink: string, source: string): Promise<void> => {
  try {
    const doesExist = await isChapterExists(mangaName, chapterNumber)
    if (doesExist) {
      return
    }
    const client = await getCachedDBClient()
    // First, get the mangaId based on the mangaName
    const mangaQuery = `SELECT id FROM manga WHERE name = $1`
    const mangaRes = await client.query(mangaQuery, [mangaName])

    if (mangaRes.rows.length === 0) {
      console.log(`Manga with name '${mangaName}' not found`)
    }

    const mangaId = mangaRes.rows[0].id

    // Insert the chapter using the fetched mangaId wtih available set to false
    const chapterQuery = `INSERT INTO chapter (manga_id, chapter_number, chapter_link, available, length, source) VALUES ($1, $2, $3, $4, $5, $6)`
    await client.query(chapterQuery, [mangaId, chapterNumber, chapterLink, false, 0, source])
  } catch (err) {
    console.error('Error inserting chapter:', err)
    throw new Error('Failed to insert chapter')
  }
}

export {
  isMangaExists,
  insertManga,
  updateManga,
  insertChapter
}