'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './TabBar.module.scss'

type TabValue = {
  key: string
  value: string
}

interface TabBarProps {
  tabs: TabValue[]
  activeIndex: number
}

const TabBar = ({ tabs, activeIndex }: TabBarProps) => {
  // A single piece of local state: which tab the user just clicked (pending route change).
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)

  // Whenever the route changes and parent's "activeIndex" now matches the clicked tab,
  // it means the new route is official, so we can clear our local "clicked" state.
  useEffect(() => {
    if (clickedIndex !== null && clickedIndex === activeIndex) {
      setClickedIndex(null)
    }
  }, [activeIndex, clickedIndex])

  // If user has clicked but not yet navigated, prioritize clickedIndex.
  // Otherwise, rely on the parent's activeIndex (from the URL).
  const effectiveIndex = clickedIndex !== null ? clickedIndex : activeIndex

  return (
    <div className={styles.wrapper}>
      <nav>
        <ul>
          {tabs.map((tab, index) => {
            const isActive = index === effectiveIndex
            return (
              <li
                key={tab.key}
                // className={isActive ? styles.active : ''}
                className={`${isActive ? styles.active : ''} ${activeIndex === index ? styles.current : ''}`}
                // On click, store that index to prevent flicker
                onClick={() => setClickedIndex(index)}
              >
                <Link href={`/me/${tab.key}`} passHref>
                  {tab.value}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default TabBar
