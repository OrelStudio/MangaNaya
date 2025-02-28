import {useMemo} from 'react'
import {useQuery, gql} from '@apollo/client'
import Title from './Title'
import ChapterControls from './ChapterControls'

import usePrevious from '../hooks/usePrevious'
import useDataLinger from '../hooks/useDataLinger'

import type {ChapterTypeWeb} from '@manga-naya/types'

import styles from './Read.module.scss'

const GET_CHAPTERS = (id: number) => gql`
  query GetChapters {
    manga(id: ${id}) {
      chapters {
        id
        manga_id
        chapter_number
        length
      }
    }
  }
`

interface ChapterInfoProps {
  mangaId: number
  mangaName: string
  chapterNumber: number
  isLoading: boolean
}

const ChapterInfo = ({mangaId, mangaName, chapterNumber, isLoading}: ChapterInfoProps) => {
  // eslint-disable-next-line no-unused-vars
  const {loading, error, data} = useQuery(GET_CHAPTERS(mangaId))
  const prevNumber = useDataLinger(usePrevious(chapterNumber))

  const chaptersOptions = useMemo(() => {
    if (!data?.manga.chapters) {
      return []
    }
    return data?.manga.chapters.map((chapter: ChapterTypeWeb) => ({
      label: `Chapter ${chapter.chapter_number}`,
      value: chapter.id,
      number: chapter.chapter_number
    }))
  }, [data])

  const currentChapter = useMemo(() => chapterNumber || prevNumber, [chapterNumber, prevNumber])
  const {previousChapter, nextChapter}: {previousChapter: ChapterTypeWeb, nextChapter: ChapterTypeWeb} = useMemo(() => {
    if (!data?.manga.chapters) {
      return {
        previousChapter: null,
        nextChapter: null
      }
    }
    const currentIndex = data.manga.chapters.findIndex((chapter: ChapterTypeWeb) => chapter.chapter_number === currentChapter)
    return {
      previousChapter: data.manga.chapters[currentIndex - 1],
      nextChapter: data.manga.chapters[currentIndex + 1]
    }
  }, [data, currentChapter])
  
  return (
    <div className={styles.info}>
      <Title name={mangaName} number={chapterNumber} />
      <ChapterControls
        currentChapter={currentChapter}
        previousChapter={previousChapter}
        nextChapter={nextChapter}
        chaptersOptions={chaptersOptions}
        isLoading={!!data}
      />
    </div>
  )
}

export default ChapterInfo