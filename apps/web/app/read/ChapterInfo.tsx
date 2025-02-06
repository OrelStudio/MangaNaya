import {useMemo} from 'react'
import {useQuery, gql} from '@apollo/client'
import ChapterPagination from './ChapterPagination'
import Title from './Title'

import usePrevious from '../hooks/usePrevious'
import useDataLinger from '../hooks/useDataLinger'

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
  const prevName = useDataLinger(usePrevious(mangaName))

  const currentChapter = useMemo(() => chapterNumber || prevNumber, [chapterNumber, prevNumber])
  const currentName = useMemo(() => mangaName || prevName, [mangaName, prevName])

  console.log(data);
  
  return (
    <div className={styles.info}>
      <Title name={currentName} number={currentChapter} />
      <div className={styles.pagination}>
        <ChapterPagination chapters={data?.manga.chapters || null} current={currentChapter} isLoading={isLoading && loading} />
      </div>
    </div>
  )
}

export default ChapterInfo