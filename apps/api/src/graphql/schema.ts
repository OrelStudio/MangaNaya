import {buildSchema} from 'graphql'

export default buildSchema(`
  type Query {
    page(page: Int!): PageType!
    manga(id: Int!): MangaQL!
    search(query: String!): [MangaQL!]!
    chapter(id: Int!): ChaptersQL!
    user(email: String!): User!
    favorites(userId: Int!): [Favorites!]!
    readingList(userId: Int!): [ReadingList!]!
    history(userId: Int!): [History!]!
    stats(userId: Int!): StatsType!
    foryou(userId: Int!): ForYouType!
  }

  type PageMangaType {
    id: Int!
    name: String!
    thumbnail: String!
    genres: [String!]!
    description: String!
    isFav: Boolean!
    inReadingList: Boolean!
    chapters: [ChapterTypeQL!]!
  }

  type PageType {
    lastPage: Int!
    mangas: [PageMangaType!]!
  }

  type ChapterTypeQL {
    id: Int!
    manga_id: Int!
    chapter_number: Float!
    available: Boolean!
    length: Int!
    read: Boolean!
    thumbnail: String
    mangaName: String!
    created_at: String
  }

  type MangaQL {
    id: Int!
    name: String!
    thumbnail: String!
    genres: [String!]!
    description: String!
    isFav: Boolean!
    inReadingList: Boolean!
    chapters: [ChapterTypeQL!]!
  }

  type ChaptersQL {
    id: Int!
    manga_id: Int!
    manga_name: String!
    chapter_number: Float!
    available: Boolean!
    length: Int!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    picture: String
    history: [History!]!
    readingList: [ReadingList!]!
    favorites: [Favorites!]!
  }

  type History {
    id: Int!
    user_id: Int!
    chapter: ChapterTypeQL!
  }

  type ReadingList {
    id: Int!
    user_id: Int!
    manga: MangaQL!
  }

  type Favorites {
    id: Int!
    user_id: Int!
    manga: MangaQL!
  }
  
  type StatsType {
    total_manga_read: Int!
    total_chapters_read: Int!
    top_genres: [String!]
    top_manga: [MangaQL!]
    last_4_chapter_reads: [ChapterTypeQL!]!
    reading_streak: Int
  }

  type GenreType {
    genre: String!
    mangas: [MangaQL!]!
  }

  type ForYouType {
    recommendations: [MangaQL!]
    popular: [MangaQL!]!
    genres: [GenreType!]!
    leftoff_manga: [MangaQL!]
  }

  type Mutation {
    deleteUser(email: String!): String!
    addHistory(userId: Int!, chapterId: Int!, mangaId: Int!): String!
    deleteHistory(historyId: Int!): String!
    toggleReadingList(userId: Int!, mangaId: Int!): String!
    toggleFavorites(userId: Int!, mangaId: Int!): String!
  }
`)