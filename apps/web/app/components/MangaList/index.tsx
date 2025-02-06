'use client'
import {Skeleton} from 'antd'

import Card from '../Card'

import type {MangaTypeDB, ChapterTypeWeb} from '@manga-naya/types'

import styles from './MangaList.module.scss'

type PageMangaType = MangaTypeDB & {
  lastPage: number,
  chapters: ChapterTypeWeb[],
  isFav: boolean,
  inReadingList: boolean
}

type DataType = {
  page: PageMangaType[]
}

interface MangaListProps {
  data: DataType
  userId: number
  wrap?: boolean
  loading?: boolean
}

const MangaList = ({
  data={page: []},
  userId, wrap = true,
  loading = false
}: MangaListProps) => {
  if (!data) {
    return (
      <div>
        <h1>500 - Internal Server Error</h1>
      </div>
    )
  }

  return (
    <div className={styles.body} style={{flexFlow: wrap ? 'wrap' : 'nowrap'}}>
      {!loading && data?.page?.map((manga) => (
        <Card
          title={manga.name}
          thumbnail={manga.thumbnail}
          chapters={manga.chapters}
          isFav={manga.isFav}
          inReadingList={manga.inReadingList}
          mangaId={manga.id}
          userId={userId}
          key={manga.id}
        />
      ))}
      {loading && Array(10).fill(0).map((_, i) => (
        <Skeleton.Input key={i} active style={{width: 200, height: 260, borderRadius: '10px'}} />
      ))}
    </div>
  )
}

export default MangaList