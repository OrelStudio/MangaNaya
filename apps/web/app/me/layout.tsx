'use client'
import {useMemo, Suspense} from 'react'
import {usePathname} from 'next/navigation'
import {Skeleton} from 'antd'
import withAuth from '../components/withAuth'

import TabBar from '../components/TabBar'
import Header from '../components/Header'

import type {UserType} from '@manga-naya/types'

import styles from './Layout.module.scss'

const Layout = ({children, user}: {children: React.ReactNode, user: UserType}) => {
  const pathname = usePathname()

  const tabs = useMemo(() => [
    {key: 'profile', value: 'Profile'},
    {key: 'reading', value: 'Reading List'},
    {key: 'favorites', value: 'Favorites'}
  ], [])

  const currentTabIndex = useMemo(() => (
    tabs.findIndex(tab => pathname.includes(tab.key))
  ), [pathname])

  return (
    <div className={styles.wrapper}>
      <Header user={user ?? null} page={tabs[currentTabIndex]?.key} />
      <div className={styles.banner}>
        <div className={styles.username}>
          {user ? (
            <span>{user.name}</span>
          ) : (
            <Skeleton.Input style={{width: 100, marginBottom: '10px', marginLeft: '2px'}} active />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <TabBar tabs={tabs} activeIndex={currentTabIndex} />
        </div>
        <div className={styles.children}>
          {children}
        </div>
      </div>
    </div>
  )
}

interface LayoutPageProps {
  children: React.ReactNode
}

const LayoutPage = (props: LayoutPageProps & {user: UserType}) => {
  const {children, user} = props

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout user={user}>
        {children}
      </Layout>
    </Suspense>
  )
}

export default withAuth(LayoutPage)