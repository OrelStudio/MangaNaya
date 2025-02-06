import React, {useMemo, useRef, useEffect, useCallback, memo, useState} from 'react'
import Link from 'next/link'
import usePrevious from '../hooks/usePrevious'
import useDataLinger from '../hooks/useDataLinger'

import styles from './ChapterPagination.module.scss'

import type {ChapterTypeDB} from '@manga-naya/types'

interface ChapterPaginationProps {
  chapters: ChapterTypeDB[]
  current: number
  isLoading: boolean
}

const ChapterPagination = ({chapters, current, isLoading}: ChapterPaginationProps) => {
  const listRef = useRef<HTMLUListElement>(null)
  const prevCurrent = useDataLinger(usePrevious(current))
  const prevChapters = useDataLinger(usePrevious(chapters))
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)

  const currentChapters = useMemo(() => {
    if (!chapters && !prevChapters) {
      return null
    }

    return chapters || prevChapters
  }, [chapters, prevChapters])

  const currentCurrent = useMemo(() => current || prevCurrent, [current, prevCurrent])
  // const [currentCurrent, setCurrent] = useDerivedState(current, () => current || prevCurrent, [current, prevCurrent])

  useEffect(() => {
    if (clickedIndex !== null && clickedIndex === currentCurrent) {
      setClickedIndex(null)
    }
  }, [currentCurrent, clickedIndex])

  const effectiveIndex = useMemo(() => clickedIndex !== null ? clickedIndex : currentCurrent, [clickedIndex, currentCurrent])

  // Scroll to active chapter
  useEffect(() => {
    if (!listRef.current) {
      return
    }
    listRef.current.querySelector(`#\\#${String(currentCurrent).replaceAll('.', '-')}`)?.scrollIntoView({behavior: 'instant', block: 'end', inline: 'center'})
  }, [chapters, isLoading])

  // Scroll horizontally
  useEffect(() => {
    const onScroll = (e: WheelEvent) => {
      if (!listRef.current) {
        return
      }
      e.preventDefault()
      
      listRef.current.scrollBy({
        left: e.deltaY * 2,
        behavior: 'smooth'
      })
    }

    listRef.current?.addEventListener('wheel', onScroll)

    return () => {
      listRef.current?.removeEventListener('wheel', onScroll)
    }
  }, [listRef.current])

  // Scroll to clicked chapter
  const onClick = useCallback((chapterNumber: number) => {
    if (!listRef.current) {
      return
    }

    setClickedIndex(chapterNumber)
    listRef.current.querySelector(`#\\#${String(chapterNumber).replaceAll('.', '-')}`)?.scrollIntoView({behavior: 'instant', block: 'end', inline: 'center'})
  }, [])

  return (
    <div className={styles.wrapper}>
      <nav>
        <ul
          ref={listRef}
          style={{
            pointerEvents: isLoading ? 'none' : 'auto',
            animationName: isLoading ? styles.loading : 'none',
            animationDuration: '1s',
            animationIterationCount: 'infinite'
          }}
        >
          {currentChapters && currentChapters.map((chapter: ChapterTypeDB, index: number) => (
            <li
              key={index}
              {...chapter.chapter_number === effectiveIndex ? {className: styles.active} : {}}
              id={`#${String(chapter.chapter_number).replaceAll('.', '-')}`}
              onClick={() => onClick(chapter.chapter_number)}
            >
              <Link href={`/read?id=${chapter.id}`} passHref>
                {chapter.chapter_number}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default memo(ChapterPagination)