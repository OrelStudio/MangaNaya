import {getCachedDBClient} from '@manga-naya/cache'

// Initialize the database
// await client.query(`CREATE TABLE IF NOT EXISTS panel (
//   id SERIAL PRIMARY KEY,
//   chapter_id INTEGER REFERENCES chapter(id) ON DELETE CASCADE,
//   manga_name TEXT NOT NULL,
//   index INTEGER NOT NULL,
//   chapter_number REAL NOT NULL,
//   file_name TEXT NOT NULL,
//   UNIQUE(chapter_id, index)
// )`)

const isThumbnailExist = async (name: string): Promise<boolean> => {
  try {
    console.log('Checking if thumbnail exists, name:', name)
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT * FROM manga WHERE name = $1`, [name])
    const manga = res.rows[0]

    if (!manga) {
      // manga doesn't exist
      throw new Error(`Manga with name '${name}' not found`)
    }

    // if the manga's thumbnail is '', then it doesn't exist
    return manga.thumbnail !== ''
  } catch (err) {
    console.error('Error checking thumbnail:', err)
    return false
  }
}

const updateManga = async (name: string, thumbnail: string): Promise<void> => {
  try {
    console.log('Updating manga, name:', name, 'thumbnail:', thumbnail)
    const client = await getCachedDBClient()
    await client.query(`UPDATE manga SET thumbnail = $1 WHERE name = $2`, [thumbnail, name])
  } catch (err) {
    console.error('Error updating manga:', err)
    throw new Error('Failed to update manga')
  }
}

// updates chapter's available status
const updateChapter = async (mangaName: string, chapterNumber: number, available: boolean, length: number): Promise<void> => {
  console.log('Updating chapter, manga name:', mangaName, 'chapter number:', chapterNumber, 'available:', available)
  try {
    const client = await getCachedDBClient()
    // Find the chapterId by mangaName and chapterNumber
    const chapterQuery = `
      SELECT chapter.id 
      FROM chapter 
      INNER JOIN manga ON chapter.manga_id = manga.id
      WHERE manga.name = $1 AND chapter.chapter_number = $2
      LIMIT 1
    `

    const chapterRes = await client.query(chapterQuery, [mangaName, chapterNumber])

    // If no chapter is found, throw an error
    if (chapterRes.rows.length === 0) {
      throw new Error(`Chapter not found for manga: ${mangaName}, chapter number: ${chapterNumber}`)
    }

    const chapterId = chapterRes.rows[0].id

    // Update the chapter's available status
    const updateQuery = `
      UPDATE chapter
      SET available = $1, length = $3
      WHERE id = $2
    `
    await client.query(updateQuery, [available, chapterId, length])
  } catch (err) {
    throw new Error(`Error updating chapter: ${err}`)
  }
}

const insertPanel = async (mangaName: string, index: number, chapterNumber: number, fileName: string): Promise<void> => {
  console.log('Inserting panel, manga name:', mangaName, 'index:', index, 'chapter number:', chapterNumber, 'file name:', fileName)
  try {
    const client = await getCachedDBClient()
    // Find the chapterId by mangaName and chapterNumber
    const chapterQuery = `
      SELECT chapter.id 
      FROM chapter 
      INNER JOIN manga ON chapter.manga_id = manga.id
      WHERE manga.name = $1 AND chapter.chapter_number = $2
      LIMIT 1
    `

    const chapterRes = await client.query(chapterQuery, [mangaName, chapterNumber])

    // If no chapter is found, throw an error
    if (chapterRes.rows.length === 0) {
      throw new Error(`Chapter not found for manga: ${mangaName}, chapter number: ${chapterNumber}`)
    }

    const chapterId = chapterRes.rows[0].id

    // Insert the panel using the found chapterId
    const panelQuery = `
      INSERT INTO panel (chapter_id, manga_name, index, chapter_number, file_name)
      VALUES ($1, $2, $3, $4, $5)
    `

    await client.query(panelQuery, [chapterId, mangaName, index, chapterNumber, fileName])

    console.log('Panel inserted successfully')
  } catch (err) {
    console.log('Error inserting panel:', err)
  }
}

const getLatestChapter = async (mangaName: string): Promise<number> => {
  try {
    console.log('Getting latest chapter, manga name:', mangaName)
    const client = await getCachedDBClient()
    const res = await client.query(`
      SELECT chapter_number 
      FROM chapter 
      INNER JOIN manga ON chapter.manga_id = manga.id
      WHERE manga.name = $1
      ORDER BY chapter_number DESC
      LIMIT 1
    `, [mangaName])

    if (res.rows.length === 0) {
      return 0
    }

    return res.rows[0].chapter_number
  } catch (err) {
    console.error('Error getting latest chapter:', err)
    return 0
  }
}

export {
  isThumbnailExist,
  updateManga,
  updateChapter,
  insertPanel,
  getLatestChapter
}