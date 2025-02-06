'use client'
import {Suspense} from 'react'
import {useSearchParams} from 'next/navigation'
import Browse from '../components/Browse'
import withAuth from '../components/withAuth'
import Header from '../components/Header'

import styles from './BrowsePage.module.scss'

import type {UserType} from '@manga-naya/types'

const BrowsePage = ({user}: {user: UserType}) => {
  const searchParams = useSearchParams()
  const page = searchParams.get('page')
  const pageInt = parseInt(page as string)

  return (
    <div>
      <div className={styles.wrapper}>
        <Header user={user ?? null} page='browse' />
        <div className={styles.content}>
          <div className={styles.browse}>
            <Browse page={pageInt ? pageInt : 1} userId={user?.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

const Component = ({user}: {user: UserType}) => (
  <Suspense fallback={<div>Loading...</div>}>
    <BrowsePage user={user} />
  </Suspense>
)

export default withAuth(Component)