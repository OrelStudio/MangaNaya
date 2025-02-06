'use client'
import {useMemo} from 'react'
import {useQuery, gql} from '@apollo/client'
import withAuth from '../../components/withAuth'
import MangaList from '../../components/MangaList'

import styles from './Reading.module.scss'

import type {UserType, MangaTypeDB, ChapterTypeWeb} from '@manga-naya/types'

type ReadingType = {
  id: number
  user_id: number
  manga: MangaTypeDB & {
    chapters: ChapterTypeWeb[]
  }
}

const GET_READING = (userId: number | null) => gql`
  query ReadingList {
    readingList(userId: ${userId}) {
      id
      user_id
      manga {
        id
        name
        thumbnail
        genres
        description
        isFav
        inReadingList
        chapters {
          id
          manga_id
          chapter_number
          available
          length
          read
          thumbnail
          mangaName
          created_at
        }
      }
    }
  }
`

const Reading = ({user}: {user: UserType}) => {
  const {loading, error, data} = useQuery(GET_READING(user?.id || null))
  const mangas = useMemo(() => data ? data?.readingList.map((reading: ReadingType) => reading.manga) : null, [data])

  if (error) {
    return <div>Something went wrong</div>
  }

  if (!mangas || loading) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <MangaList data={{page: mangas}} userId={user.id} />
          {!mangas.length && (
            <div className={styles.empty}>
              <span>Empty List</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default withAuth(Reading)