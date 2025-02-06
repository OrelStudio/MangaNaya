import type {ChapterTypeDB} from './ChapterType'

export type MangaTypeDB = {
  id: number
  name: string
  thumbnail: string
  genres: string[]
  description: string
}

export type MangaItemType = {
  name: string
  linkToManga: string
  thumbnailLink: string
  genres: string[]
  description: string
}

export type MangaQL = {
  id: number,
  name: string,
  thumbnail: string
  genres: string[]
  description: string
  chapters: () => Promise<ChapterTypeDB[]>
}

export type PageMangaType = {
  id: number
  name: string
  thumbnail: string
  genres: string[]
  description: string
  chapters: () => Promise<ChapterTypeDB[]>
}

export type PageType = {
  lastPage: number
  mangas: PageMangaType[]
}