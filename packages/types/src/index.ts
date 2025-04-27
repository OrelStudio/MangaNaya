import type {MangaTypeDB, MangaQL, MangaItemType, PageMangaType, PageType} from './MangaType'
import type {ChapterTypeDB, ChaptersQL, ChapterType, ChapterResultsType, ChapterTypeWeb} from './ChapterType'
import type {PanelTypeDB, PanelType} from './PanelType'
import type {ThumbnailType} from './ThumbnailType'
import type {
  UserType,
  UserResultType,
  HistoryType,
  ReadingListType,
  FavoritesType,
  UserProfileStatsType,
  StatsType,
  ForYouPageType,
  ForYouType,
} from './UserType'

type SourceType = 'sourceOne' | 'sourceTwo'

export type {
  MangaTypeDB,
  MangaItemType,
  MangaQL,
  PageMangaType,
  PageType,

  ChapterTypeDB,
  ChapterType,
  ChapterResultsType,
  ChaptersQL,
  ChapterTypeWeb,

  PanelTypeDB,
  PanelType,

  ThumbnailType,

  UserType,
  UserResultType,
  HistoryType,
  ReadingListType,
  FavoritesType,
  UserProfileStatsType,
  StatsType,
  ForYouPageType,
  ForYouType,

  SourceType
}
