'use client'
import {Suspense} from 'react'
import {useSearchParams, useRouter} from 'next/navigation'

import withAuth from '../components/withAuth'
import Panel from '../components/Panel'
import useChapter from '../hooks/useChapter'
import ChapterInfo from './ChapterInfo'
import Header from '../components/Header'

import useScrollDelta from '../hooks/useScrollDelta'

import type {UserType} from '@manga-naya/types'

import styles from './Read.module.scss'

const Read = ({user}: {user: UserType}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chapterId = searchParams.get('id')
  const pageInt = parseInt(chapterId as string)

  // check if chapterId is number and integer
  if (!chapterId || isNaN(pageInt)) {
    router.push('/')
  }

  const {loading, error, data} = useChapter(pageInt ?? 1)
  
  return (
    <div>
      <Header user={user ?? null} />
      <div className={styles.main}>
        <ChapterInfo
          mangaId={data?.manga_id}
          mangaName={data?.manga_name}
          chapterNumber={data?.chapter_number}
          isLoading={loading}
        />
        <div className={styles.chapter}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            Array.from({length: data?.length || 0}).map((_, i) => (
              <Panel key={i} chapterId={data.id} index={i + 1} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const ReadPage = ({user}: {user: UserType}) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Read user={user} />
  </Suspense>
)

export default withAuth(ReadPage)