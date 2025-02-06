'use client'
import {useQuery, gql} from '@apollo/client'
import withAuth from '../../components/withAuth'
import {FireOutlined} from '@ant-design/icons'
import {BookOpenOutlined, BookOutlined, ChartColumnOutlined} from '../../components/Icon'

import CardContent from '../../components/CardContent'
import Genres from '../../components/Genres'
import Item from '../../components/Item'

import styles from './Profile.module.scss'

import type {UserType, MangaTypeDB, ChapterTypeWeb} from '@manga-naya/types'

const GET_STATS = (userId: number | null) => gql`
  query Stats {
    stats(userId: ${userId}) {
      total_manga_read
      total_chapters_read
      top_genres
      reading_streak
      top_manga {
        id
        name
        genres
        thumbnail
      }
      last_4_chapter_reads {
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
`

const Profile = ({user}: {user: UserType}) => {
  const {data} = useQuery(GET_STATS(user?.id || null))

  if (!data) {
    return null
  }
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <CardContent
          title='Reading Streak'
          value={data.stats.reading_streak}
          
          icon={<FireOutlined />}
          color='#e74c3c'
        />
        <CardContent
          title='Total Manga Read'
          value={data.stats.total_manga_read}
          
          icon={<BookOpenOutlined />}
          color='#3b82f6'
        />
        <CardContent
          title='Total Chapters Read'
          value={data.stats.total_chapters_read}
          
          icon={<BookOutlined />}
          color='#2ecc71'
        />
        <CardContent
          title='Top Genres'
          value={<Genres genres={data.stats.top_genres} />}
          
          icon={<ChartColumnOutlined />}
          color='#6b21a8'
        />
      </div>
      <div className={styles.section}>
        <CardContent
          title='Top Manga'
          value={(
            <div className={styles.rows}>
              {data.stats.top_manga.length ? data.stats.top_manga.map((manga: MangaTypeDB) => (
                <Item src={manga.thumbnail} alt={manga.name} url={`/manga/?id=${manga.id}`} key={manga.id} />
              )) : (
                <div className={styles.noData}>{'No Mangas Available'}</div>
              )}
            </div>
          )}
          
          color='#6b21a8'
        />
        <CardContent
          title='History'
          value={(
            <div className={styles.history}>
              {data.stats.last_4_chapter_reads.length ? data.stats.last_4_chapter_reads.map((chapter: ChapterTypeWeb) => (
                <div className={styles.historyItem} key={chapter.id}>
                  <Item
                    src={chapter.thumbnail}
                    alt={`${chapter.chapter_number}`}
                    url={`/read?id=${chapter.id}`}
                    key={chapter.id}
                    title={chapter.mangaName}
                    subtitle={`${chapter.chapter_number}`}
                    time={Number(chapter.created_at)}
                  />
                </div>
              )) : (
                <div className={styles.noData}>{'Empty'}</div>
              )}
            </div>
          )}
          
          color='#6b21a8'
        />
      </div>
    </div>
  )
}

export default withAuth(Profile)