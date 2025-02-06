'use client'
import {Suspense} from 'react'
import {useSearchParams} from 'next/navigation'
import {useQuery, gql} from '@apollo/client'
import Link from 'next/link'

import withAuth from '../components/withAuth'
import Manga from '../components/Manga'

import styles from './MangaPage.module.scss'

const GET_MANGA = (id: number) => gql`
  query GetManga {
    manga(id: ${id}) {
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
      }
    }
  }
`

const MangaPage = () => {
  const searchParams = useSearchParams()
  const chapterId = searchParams.get('id')
  const pageInt = parseInt(chapterId as string)

  const {loading, error, data} = useQuery(GET_MANGA(pageInt ?? 1))

  if (error) {
    return <div>Something went wrong</div>
  }

  if (!data?.manga) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.info}>
          <Manga
            loading={loading}
            thumbnail={data?.manga.thumbnail}
            name={data?.manga.name}
            description={data?.manga.description}
            genres={data?.manga.genres}
          />
        </div>
        <div className={styles.chapters}>
          <span className={styles.chapterTitle}>Chapters</span>
          <div className={styles.grid}>
            {data?.manga.chapters.toReversed().map((chapter: any, i: number) => (
              <Link href={`/read?id=${chapter.id}`} key={i} className={styles.chapter} style={{backgroundColor: chapter.read ? 'var(--accent)' : 'var(--primary)'}}>
                <span>{chapter.chapter_number}</span>
              </Link>
            ))}
            {data?.manga.chapters.length === 0 && (
              <div className={styles.noChapters}>{'No chapters found :('}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MangaPageWithAuth() {
  const Component = withAuth(MangaPage)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
}