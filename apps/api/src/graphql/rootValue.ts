import {
  manga,
  page,
  search,
  chapter,
} from '../resolvers/manga'

import {
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
} from '../resolvers/users'

const rootValue = {
  // Query fields
  manga,
  page,
  search,
  chapter,
  user,
  favorites,
  readingList,
  history,
  stats,
  foryou,

  // Mutation fields
  deleteUser,
  addHistory,
  deleteHistory,
  toggleReadingList,
  toggleFavorites
}

export default rootValue