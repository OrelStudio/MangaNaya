import {useCallback, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {useQuery, gql} from '@apollo/client'
import ChapterPagination from './ChapterPagination'
import {ConfigProvider, Select} from 'antd'
import Title from './Title'

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
  const router = useRouter()
  // eslint-disable-next-line no-unused-vars
  const {loading, error, data} = useQuery(GET_CHAPTERS(mangaId))
  const prevNumber = useDataLinger(usePrevious(chapterNumber))
  const prevName = useDataLinger(usePrevious(mangaName))

  const onChange = useCallback((value: string) => {
    router.push(`/read?id=${value}`)
  }, [])

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
  const currentName = useMemo(() => mangaName || prevName, [mangaName, prevName])
  
  return (
    <div className={styles.info}>
      <Title name={currentName} number={currentChapter} />
      <div className={styles.pagination}>
        <span style={{fontFamily: 'sans-serif'}}>{'Select Chapter'}</span>
        <ConfigProvider
          theme={{
            components: {
              Select: {
                selectorBg: 'var(--strong)',
                optionSelectedBg: 'var(--primary)',
                multipleItemColorDisabled: 'var(--disabled-text)',
                hoverBorderColor: 'var(--primary)',
                activeBorderColor: 'var(--primary)',
                activeOutlineColor: 'var(--text)',
                multipleItemBorderColor: 'var(--stong)',
                optionSelectedColor: 'var(--text)',
                colorText: 'var(--text)',
                colorTextPlaceholder: 'var(--text)'
              }
            }
          }}
        >
          
          {currentChapter && <Select
            showSearch
            placeholder="Select chapter"
            optionFilterProp="label"
            className={styles.select}
            dropdownStyle={{backgroundColor: 'var(--strong)'}}
            onChange={onChange}
            options={chaptersOptions}
            defaultValue={`Chapter ${currentChapter}`}
          />}
        </ConfigProvider>
      </div>
    </div>
  )
}

export default ChapterInfo