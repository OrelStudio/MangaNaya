import {getDBClient} from '@manga-naya/cache'

import {
  getMangas as getMangasDB,
  getManga as getMangaDB,
  searchManga as searchMangaDB,
  getChapters as getChaptersDB,
  getChapter as getChapterDB,
  getMangasPages as getMangasPagesDB
} from './manga'

import {
  createUser as createUserDB,
  getUser as getUserDB,
  removeUser as removeUserDB,
  isUserExist as isUserExistDB,

  getHistory as getHistoryDB,
  insertHistory as insertHistoryDB,
  removeHistory as removeHistoryDB,

  getReadingList as getReadingListDB,
  toggleReading as toggleReadingDB,

  getFavorites as getFavoritesDB,
  toggleFav as toggleFavDB,
  getStats as getStatsDB,
  getForYouPage as getForYouPageDB
} from './user'

const client = await getDBClient()

process.on('SIGINT', client.close)
process.on('SIGKILL', client.close)
process.on('SIGTERM', client.close)
process.on('exit', client.close)

export const getMangas = getMangasDB.bind(null, client.client)
export const getManga = getMangaDB.bind(null, client.client)
export const searchManga = searchMangaDB.bind(null, client.client)
export const getChapters = getChaptersDB.bind(null, client.client)
export const getChapter = getChapterDB.bind(null, client.client)
export const getMangasPages = getMangasPagesDB.bind(null, client.client)

export const createUser = createUserDB.bind(null, client.client)
export const getUser = getUserDB.bind(null, client.client)
export const removeUser = removeUserDB.bind(null, client.client)
export const isUserExist = isUserExistDB.bind(null, client.client)

export const getHistory = getHistoryDB.bind(null, client.client)
export const insertHistory = insertHistoryDB.bind(null, client.client)
export const removeHistory = removeHistoryDB.bind(null, client.client)

export const getReadingList = getReadingListDB.bind(null, client.client)
export const toggleReading = toggleReadingDB.bind(null, client.client)

export const getFavorites = getFavoritesDB.bind(null, client.client)
export const toggleFav = toggleFavDB.bind(null, client.client)
export const getStats = getStatsDB.bind(null, client.client)
export const getForYouPage = getForYouPageDB.bind(null, client.client)