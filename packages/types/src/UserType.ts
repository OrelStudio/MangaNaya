import type {MangaTypeDB} from './MangaType'
import type {ChaptersQL} from './ChapterType'

type MangaType = MangaTypeDB & {
  chapters: ChaptersQL[]
}

export type UserType = {
  id: number
  name: string
  email: string
  picture: string
}

export type UserResultType = {
  id: number
  name: string
  email: string
  picture: string
}

export type HistoryType = {
  id: number
  user_id: number
  chapter_id: number
  created_at: Date
}

export type ReadingListType = {
  id: number
  user_id: number
  manga_id: number
  chapter_number: number
}

export type FavoritesType = {
  id: number
  user_id: number
  manga_id: number
}

export type UserProfileStatsType = {
  total_manga_read: number
  total_chapters_read: number
  top_genre: string[] | null // could be null if user has not read any manga
  top_manga: number[] | null // could be null if user has not read any manga
  last_4_chapter_reads: number[]
  reading_streak: number
}

export type StatsType = {
  total_manga_read: number
  total_chapters_read: number
  top_genre: string[]
  top_manga: MangaType[]
  last_4_chapter_reads: ChaptersQL[]
  reading_streak: number
}

export type ForYouPageType = {
  recommended_manga: number[]
  popular_manga: number[]
  genres: {
    genre: string
    manga: number[]
  }[],
  leftoff_manga: number[] // manga that the user left off reading
}

export type ForYouType = {
  recommended_manga: MangaType[]
  popular_manga: MangaType[]
  genres: {
    genre: string
    manga: MangaType[]
  }[],
  leftoff_manga: MangaType[]
}