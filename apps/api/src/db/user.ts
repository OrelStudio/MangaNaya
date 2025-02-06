import {getCachedDBClient} from '@manga-naya/cache'

import type {
  UserType,
  HistoryType,
  ReadingListType,
  FavoritesType,
  UserProfileStatsType,
  ForYouPageType
} from '@manga-naya/types'

const createUser = async (name: string, email: string, picture: string): Promise<void> => {
  try {
    const client = await getCachedDBClient()
    await client.query(`INSERT INTO Users (email, name, picture) VALUES ($1, $2, $3)`, [email, name, picture])
  } catch (err) {
    console.error('Error creating user:', err)
    throw new Error('Failed to create user')
  }
}
const isUserExist = async (email: string): Promise<boolean> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT * FROM Users WHERE email = $1`, [email])
    return res.rows.length > 0
  } catch (err) {
    console.error('Error checking user:', err)
    throw new Error('Failed to check user')
  }
}
const getUser = async (email: string): Promise<UserType> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT * FROM Users WHERE email = $1`, [email])
    return res.rows[0]
  } catch (err) {
    console.error('Error getting user:', err)
    throw new Error('Failed to get user')
  }
}

const removeUser = async (email: string): Promise<void> => {
  try {
    const client = await getCachedDBClient()
    await client.query(`DELETE FROM Users WHERE email = $1`, [email])
  } catch (err) {
    console.error('Error removing user:', err)
    throw new Error('Failed to remove user')
  }
}

const getHistory = async (userId: number): Promise<HistoryType[]> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT * FROM history WHERE user_id = $1`, [userId])
    return res.rows
  } catch (err) {
    console.error('Error getting history:', err)
    throw new Error('Failed to get history')
  }
}

const getReadingList = async (userId: number): Promise<ReadingListType[]> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT * FROM reading_list WHERE user_id = $1`, [userId])
    return res.rows
  } catch (err) {
    console.error('Error getting reading list:', err)
    throw new Error('Failed to get reading list')
  }
}

const getFavorites = async (userId: number): Promise<FavoritesType[]> => {
  try {
    const client = await getCachedDBClient()
    const res = await client.query(`SELECT * FROM favorites WHERE user_id = $1`, [userId])
    return res.rows
  } catch (err) {
    console.error('Error getting favorites:', err)
    throw new Error('Failed to get favorites')
  }
}

const insertHistory = async (userId: number, chapterId: number, mangaId: number): Promise<void> => {
  try {
    const client = await getCachedDBClient()
    await client.query(`INSERT INTO history (user_id, chapter_id, manga_id) VALUES ($1, $2, $3)`, [userId, chapterId, mangaId])
  } catch (err) {
    console.error('Error inserting history:', err)
    throw new Error('Failed to insert history')
  }
}

const removeHistory = async (historyId: number): Promise<void> => {
  try {
    const client = await getCachedDBClient()
    await client.query(`DELETE FROM history WHERE id = $1`, [historyId])
  } catch (err) {
    console.error('Error removing history:', err)
    throw new Error('Failed to remove history')
  }
}

const toggleReading = async (userId: number, mangaId: number): Promise<void> => {
  try {
    const client = await getCachedDBClient()
    
    // Check if entry already exists
    const {rows} = await client.query(
      `SELECT id FROM reading_list WHERE user_id = $1 AND manga_id = $2`,
      [userId, mangaId]
    )

    // If it exists, remove it
    if (rows.length > 0) {
      const readingListId = rows[0].id
      await client.query(`DELETE FROM reading_list WHERE id = $1`, [readingListId])
    } else {
      // Otherwise, insert a new row
      await client.query(
        `INSERT INTO reading_list (user_id, manga_id) VALUES ($1, $2)`,
        [userId, mangaId]
      )
    }
  } catch (err) {
    console.error('Error toggling reading list:', err)
    throw new Error('Failed to toggle reading list')
  }
}

const toggleFav = async (userId: number, mangaId: number): Promise<void> => {
  try {
    const client = await getCachedDBClient()
    
    // Check if entry already exists
    const {rows} = await client.query(
      `SELECT id FROM favorites WHERE user_id = $1 AND manga_id = $2`,
      [userId, mangaId]
    )

    // If it exists, remove it
    if (rows.length > 0) {
      const favoritesId = rows[0].id
      await client.query(`DELETE FROM favorites WHERE id = $1`, [favoritesId])
    } else {
      // Otherwise, insert a new row
      await client.query(
        `INSERT INTO favorites (user_id, manga_id) VALUES ($1, $2)`,
        [userId, mangaId]
      )
    }
  } catch (err) {
    console.error('Error toggling favorites:', err)
    throw new Error('Failed to toggle favorites')
  }
}

const getStats = async (userId: number): Promise<UserProfileStatsType> => {
  try {
    const client = await getCachedDBClient()

    const query = `
      WITH
      top_genres AS (
        SELECT array_agg(g.genre) AS arr
        FROM (
          SELECT unnest(m.genres) AS genre,
            COUNT(*) AS freq
          FROM history h
          JOIN manga m ON m.id = h.manga_id
          WHERE h.user_id = $1
          GROUP BY 1
          ORDER BY freq DESC
          LIMIT 3
        ) g
      ),
      reading_days AS (
        SELECT DISTINCT DATE(h.created_at) AS day
        FROM history h
        WHERE h.user_id = $1
      ),
      reading_streak_cte AS (
        SELECT
          day,
          day - (ROW_NUMBER() OVER (ORDER BY day DESC) * INTERVAL '1 day') AS group_marker
        FROM reading_days
      ),
      reading_streak_group AS (
        SELECT group_marker,
          COUNT(*) AS cnt
        FROM reading_streak_cte
        GROUP BY group_marker
        ORDER BY group_marker DESC
        LIMIT 1
      ),
      last_4_chapters AS (
        SELECT array_agg(sub.chapter_id) AS arr
        FROM (
          SELECT h.chapter_id
          FROM history h
          WHERE h.user_id = $1
          ORDER BY h.created_at DESC
          LIMIT 4
        ) sub
      )
      SELECT
        (
          SELECT COUNT(DISTINCT h.manga_id)
          FROM history h
          WHERE h.user_id = $1
        ) AS total_manga_read,
        (
          SELECT COUNT(DISTINCT h.chapter_id)
          FROM history h
          WHERE h.user_id = $1
        ) AS total_chapters_read,
        (SELECT arr FROM top_genres) AS top_genres,
        (
          SELECT array_agg(t.manga_id)
          FROM (
            SELECT m.id AS manga_id,
              COUNT(DISTINCT h.chapter_id) AS chapters_read
            FROM history h
            JOIN manga m ON m.id = h.manga_id
            WHERE h.user_id = $1
            GROUP BY m.id
            ORDER BY chapters_read DESC
            LIMIT 3
          ) t
        ) AS top_manga,
        COALESCE((SELECT arr FROM last_4_chapters), '{}') AS last_4_chapter_reads,
        COALESCE((SELECT cnt FROM reading_streak_group), 0) AS reading_streak
      ;
    `

    const res = await client.query(query, [userId])

    return res.rows[0]
  } catch (err) {
    console.error('Error getting stats:', err)
    throw new Error('Failed to get stats')
  }
}

const getForYouPage = async (userId: number): Promise<ForYouPageType> => {
  try {
    const client = await getCachedDBClient()

    // PART A: Find user’s top genres from reading history
    const userTopGenresQuery = `
      WITH user_genre_counts AS (
        SELECT unnest(m.genres) AS genre,
            COUNT(*) AS read_count
          FROM history h
          JOIN manga m ON m.id = h.manga_id
        WHERE h.user_id = $1
        GROUP BY genre
      )
      SELECT genre
        FROM user_genre_counts
      ORDER BY read_count DESC
      LIMIT 5
    `

    const {rows: userTopGenresRows} = await client.query(userTopGenresQuery, [userId])
    const userTopGenres: string[] = userTopGenresRows.map(row => row.genre)

    // PART B: Recommended Manga

    let recommendedManga: number[] = []
    if (userTopGenres.length > 0) {
      const recommendedQuery = `
        WITH user_genres AS (
          SELECT unnest($1::text[]) AS genre
        ),
        manga_popularity AS (
          SELECT manga_id, COUNT(*)::int AS total_reads
            FROM history
            GROUP BY manga_id
        )
        SELECT m.id
          FROM manga m
            -- exclude manga that user already has in history
            LEFT JOIN history h ON h.manga_id = m.id AND h.user_id = $2
            -- join to popularity stats
            LEFT JOIN manga_popularity mp ON mp.manga_id = m.id
        WHERE h.id IS NULL
          AND EXISTS (
            SELECT 1
              FROM user_genres ug
              WHERE ug.genre = ANY(m.genres)
            )
        GROUP BY m.id, mp.total_reads
        ORDER BY COALESCE(mp.total_reads, 0) DESC
        LIMIT 10
      `

      const {rows: recommendedRows} = await client.query(recommendedQuery, [userTopGenres, userId])
      recommendedManga = recommendedRows.map(row => row.id)
    }

    // PART C: Popular Manga

    const popularMangaQuery = `
      SELECT h.manga_id AS id
      FROM history h
      GROUP BY h.manga_id
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `

    const {rows: popularRows} = await client.query(popularMangaQuery)
    const popularManga: number[] = popularRows.map(row => row.id)

    // PART D: Top 5 Genres (Global)

    const topGenresQuery = `
      WITH genre_counts AS (
        SELECT unnest(m.genres) AS genre,
          COUNT(*) AS total_reads
          FROM history h
          JOIN manga m ON m.id = h.manga_id
        GROUP BY genre
      )
      SELECT genre
        FROM genre_counts
      ORDER BY total_reads DESC
      LIMIT 5
    `

    const {rows: topGlobalGenresRows} = await client.query(topGenresQuery)
    const globalTopGenres: string[] = topGlobalGenresRows.map(row => row.genre)

    const genresResult: {genre: string; manga: number[]}[] = []

    for (const genre of globalTopGenres) {
      const genreMangaQuery = `
        WITH manga_popularity AS (
          SELECT manga_id, COUNT(*)::int AS total_reads
          FROM history
          GROUP BY manga_id
        )
        SELECT m.id
          FROM manga m
          LEFT JOIN manga_popularity mp ON mp.manga_id = m.id
        WHERE $1 = ANY(m.genres)
        GROUP BY m.id, mp.total_reads
        ORDER BY COALESCE(mp.total_reads, 0) DESC
        LIMIT 10
      `
      const { rows: genreRows } = await client.query(genreMangaQuery, [genre])
      genresResult.push({
        genre,
        manga: genreRows.map((r) => r.id),
      })
    }

    const leftoffMangaQuery = `
      SELECT DISTINCT ON (manga_id) manga_id, created_at
      FROM history
      WHERE user_id = $1
      ORDER BY manga_id, created_at DESC
    `
    const { rows: leftoffRows } = await client.query(leftoffMangaQuery, [userId])
    const leftoffManga: number[] = leftoffRows.map(row => row.manga_id)

    const forYouPageData: ForYouPageType = {
      recommended_manga: recommendedManga,
      popular_manga: popularManga,
      genres: genresResult,
      leftoff_manga: leftoffManga
    }

    return forYouPageData
  } catch (err) {
    console.error('Error getting for you page:', err)
    throw new Error('Failed to get for you page')
  }
}

export {
  createUser,
  getUser,
  removeUser,
  isUserExist,

  getHistory,
  insertHistory,
  removeHistory,

  getReadingList,
  toggleReading,

  getFavorites,
  toggleFav,

  getStats,
  getForYouPage
}