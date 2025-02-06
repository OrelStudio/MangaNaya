import {useMemo, useCallback} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import Image from 'next/image'
import Button from '../../Button'
import {Select, ConfigProvider} from 'antd'

import ActionButton from '../../ActionButton'

import type {ChapterTypeWeb} from '@manga-naya/types'

import styles from './Max.module.scss'

interface MaxCardProps {
  title: string
  thumbnail: string
  chapters: ChapterTypeWeb[]
  isFav: boolean
  inReadingList: boolean
  onFav: () => void
  onReadingList: () => void
  favLoading: boolean
  readingLoading: boolean
}

const MaxCard = ({title, thumbnail, chapters, isFav, inReadingList, onFav, onReadingList, favLoading, readingLoading}: MaxCardProps) => {
  const router = useRouter()

  const chaptersOptions = useMemo(() => {
    return chapters.map((chapter) => ({
      label: `Chapter ${chapter.chapter_number}`,
      value: chapter.id
    }))
  }, [chapters])

  const lastRead = useMemo(() => {
    const reversed = chapters.slice().reverse()
    return reversed.find((chapter) => chapter.read)
  }, [chapters])

  const onChange = useCallback((value: string) => {
    router.push(`/read?id=${value}`)
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.max}>
        <div className={styles.thumbnail}>
          <Image src={thumbnail} alt={title} width={200} height={200} />
        </div>
        <div className={styles.details}>
          <div className={styles.title}>
            <span>{title}</span>
          </div>

          {chapters.length && chaptersOptions.length > 0 ? (
          <>
            <div className={styles.last}>
              <span className={styles.subtitle}>{lastRead ? 'Continue Reading' : 'Start Reading'}</span>
              <Button>
                <Link
                  href={`/read?id=${lastRead ? lastRead.id : chapters[0]?.id}`}
                >{lastRead ? `Chapter ${lastRead.chapter_number}` : `Chapter ${chapters[0]?.chapter_number}`}</Link>
              </Button>
            </div>

            <div className={styles.chapters}>
              <span className={styles.subtitle}>{lastRead ? 'Or jump to' : 'Jump to'}</span>
              <ConfigProvider
                theme={{
                  components: {
                    Select: {
                      selectorBg: 'var(--strong)',
                      optionSelectedBg: 'var(--primary)',
                      multipleItemColorDisabled: 'var(--disabled-text)',
                      hoverBorderColor: 'var(--primary)',
                      activeBorderColor: 'var(--primary)',
                      activeOutlineColor: 'var(--text)',
                      multipleItemBorderColor: 'var(--stong)',
                      optionSelectedColor: 'var(--text)'
                    }
                  }
                }}
              >
                
                <Select
                  showSearch
                  placeholder="Select chapter"
                  optionFilterProp="label"
                  className={styles.select}
                  dropdownStyle={{backgroundColor: 'var(--strong)'}}
                  onChange={onChange}
                  options={chaptersOptions}
                />
              </ConfigProvider>
            </div>
          </>
          ) : (
            <div className={styles.last}>
              <span className={styles.subtitle}>No chapters available</span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <ActionButton icon='bookmark' onClick={onReadingList} active={inReadingList} loading={readingLoading} />
        <ActionButton icon='star' onClick={onFav} active={isFav} loading={favLoading} />
      </div>
    </div>
  )
}

export default MaxCard