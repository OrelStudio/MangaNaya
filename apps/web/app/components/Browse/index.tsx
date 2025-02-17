import {useState, useCallback, useMemo} from 'react'
import {useQuery, gql} from '@apollo/client'
import {redirect} from 'next/navigation'
import {Pagination, ConfigProvider} from 'antd'
import MangaList from '../MangaList'
import Search from '../Search'

import type {MangaTypeDB, ChaptersQL} from '@manga-naya/types'

import styles from './Browse.module.scss'

type MangaType = MangaTypeDB & {
  chapters: ChaptersQL[]
}

const GET_PAGE = (page: number) => gql`
  query GetData {
    page(page: ${page}) {
      lastPage
      mangas {
        id
        name
        thumbnail
        isFav
        inReadingList
        genres
        chapters {
          id
          chapter_number
          length
          read
        }
      }
    }
  }
`

interface BrowseProps {
  page: number,
  userId: number
}

const Browse = ({page, userId}: BrowseProps) => {
  const [searchData, setSearchData] = useState<MangaType[]>([])
  const [search, setSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const {loading, error, data} = useQuery(GET_PAGE(page))

  const onChange = useCallback((results: MangaType[], value: string, loading: boolean) => {
    setSearchData(results)
    setSearch(value)
    setSearchLoading(loading)
  }, [])

  const currentData = useMemo(() => searchData.length > 0 && search.trim() !== '' ? {page: searchData} : {page: data?.page.mangas}, [searchData, data])

  // if (error) {
  //   return (
  //     <div style={{color: 'var(--text)', fontSize: '1.5rem'}}>
  //       Something went wrong
  //     </div>
  //   )
  // }
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.contentHeader}>
        <div className={styles.title}>
          <span>Browse</span>
        </div>
        <Search onChange={onChange} />
      </div>
      <MangaList data={currentData} userId={userId} loading={loading || searchLoading} />
      {(!searchLoading) && !currentData.page?.length && search.trim() !== '' && (
        <div className={styles.empty}>
          <span>No Results</span>
        </div>
      )}
      <div className={styles.pagination}>
        {data && data.page.lastPage > 1 && search.trim() === '' && (
          <ConfigProvider
            theme={{
              components: {
                Pagination: {
                  itemActiveBg: 'var(--strong)',
                  itemBg: 'var(--secondary)',
                  colorPrimaryHover: 'var(--accent)',
                  colorPrimary: 'var(--accent)',
                  colorBgTextHover: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }}
          >
            <Pagination
              current={page}
              total={data?.page.lastPage}
              pageSize={1}
              onChange={(page) => redirect(`/browse?page=${page}`)}
            />
          </ConfigProvider>
        )}
      </div>
    </div>
  )
}

export default Browse