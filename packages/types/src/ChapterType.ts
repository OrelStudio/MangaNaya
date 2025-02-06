import type {PanelType} from './PanelType'

export type ChapterType = {
  mangaName: string
  index: number
  length: number
  Panels: PanelType[]
}

export type ChapterResultsType = {
  index: number
  link: string
}

export type ChapterTypeDB = {
  id: number
  manga_id: number
  chapter_number: number
  chapter_link: string
  available: boolean
  length: number
  source: string
  thumbnail: string
}

export type ChapterTypeWeb = {
  id: number
  manga_id: number
  chapter_number: number
  available: boolean
  length: number
  read: boolean
  thumbnail: string
  mangaName: string
  created_at: string // Date of when the chapter was read by the user
}

export type ChaptersQL = {
  id: number
  manga_id: number
  manga_name: string
  chapter_number: number
  available: boolean
  length: number
}