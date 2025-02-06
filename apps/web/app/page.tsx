'use client'
import {useQuery, gql} from '@apollo/client'

import withAuth from './components/withAuth'
import Section from './explore/Section'
import Header from './components/Header'
import Stats from './explore/Stats'

import styles from './explore/Explore.module.scss'

import type {UserType, MangaTypeDB, ChapterTypeWeb} from '@manga-naya/types'

type PageMangaType = MangaTypeDB & {
  lastPage: number,
  chapters: ChapterTypeWeb[],
  isFav: boolean,
  inReadingList: boolean
}

const GET_FOR_YOU = (userId: number | null) => gql`
  query Foryou {
    foryou(userId: ${userId}) {
      recommendations {
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
      popular {
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
      genres {
        genre
        mangas {
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
      leftoff_manga {
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

interface ExploreProps {
  user: UserType
}

const Explore: React.FC<ExploreProps> = ({user}) => {
  // eslint-disable-next-line no-unused-vars
  const {loading, error, data} = useQuery(GET_FOR_YOU(user?.id || null))

  if (!user) {
    return null
  }

  return (
    <div>
      <Header user={user} page='explore' />
      <div className={styles.wrapper}>
        <span className={styles.title}>Explore</span>
        <div className={styles.content}>
          <Stats userId={user?.id} />
          <Section title='Popular' data={data?.foryou.popular} userId={user?.id} />
          <Section title='Continue Reading' data={data?.foryou.leftoff_manga} userId={user?.id} />
          <Section title='Recommendations' data={data?.foryou.recommendations} userId={user?.id} />
          {data && data?.foryou.genres.map((genre: {genre: string, mangas: PageMangaType[]}, i: number) => (
            <Section key={i} title={genre?.genre} data={genre?.mangas} userId={user?.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default withAuth(Explore)