import {useRef} from 'react'
import {Skeleton} from 'antd'
import Card from '../components/Card'
import Carousel from './Carousel'
import useWheelScroll from '../hooks/useWheelScroll'

import type {MangaTypeDB, ChapterTypeWeb} from '@manga-naya/types'

import styles from './Section.module.scss'

type PageMangaType = MangaTypeDB & {
  lastPage: number,
  chapters: ChapterTypeWeb[],
  isFav: boolean,
  inReadingList: boolean
}

interface SectionProps {
  title: string
  data: PageMangaType[]
  userId: number
}

const Section = ({title, data, userId}: SectionProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useWheelScroll(ref)

  return (
    <div className={styles.section}>
      <span className={styles.title}>{title}</span>
      <div className={styles.cards}>
        <Carousel>
          {data && data.map((manga) => (
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
          {!data && Array(10).fill(0).map((_, i) => (
            <Skeleton.Input key={i} active style={{width: 200, height: 300}} />
          ))}
        </Carousel>
      </div>
    </div>
  )
}

export default Section