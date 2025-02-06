import {useCallback, useState, useEffect} from 'react'
import {Modal, ConfigProvider} from 'antd'
import MiniCard from './Mini'
import MaxCard from './Max'
import {useMutation, gql} from '@apollo/client'


import type {ChapterTypeWeb} from '@manga-naya/types'

import styles from './Card.module.scss'

const TOGGLE_READING = gql`
  mutation ToggleReadingList($userId: Int!, $mangaId: Int!) {
    toggleReadingList(userId: $userId, mangaId: $mangaId)
  }
`

const TOGGLE_FAV = gql`
  mutation ToggleFavorites($userId: Int!, $mangaId: Int!) {
    toggleFavorites(userId: $userId, mangaId: $mangaId)
  }
`

interface CardProps {
  title: string
  thumbnail: string
  chapters: ChapterTypeWeb[]
  isFav: boolean
  inReadingList: boolean
  mangaId: number
  userId: number
}

const Card = ({title, thumbnail, chapters, isFav, inReadingList, mangaId, userId}: CardProps) => {
  const [toggleReading, {loading: readingLoading, error: readingError}] = useMutation(TOGGLE_READING)
  const [toggleFav, {loading: favLoading, error: favError}] = useMutation(TOGGLE_FAV)
  const [isFavState, setIsFav] = useState(isFav)
  const [inReadingListState, setInReadingList] = useState(inReadingList)
  const [expanded, setExpanded] = useState(false)

  const onFav = useCallback(() => {
    toggleFav({variables: {userId, mangaId}})
    setIsFav(prev => !prev)
  }, [])

  const onReadingList = useCallback(() => {
    toggleReading({variables: {userId, mangaId}})
    setInReadingList(prev => !prev)
  }, [])

  // Whenever a new error appears, revert state
  useEffect(() => {
    if (favError) {
      setIsFav(prev => !prev)
    }
  }, [favError])

  useEffect(() => {
    if (readingError) {
      setInReadingList(prev => !prev)
    }
  }, [readingError])

  const onClose = useCallback(() => {
    setExpanded(false)
  }, [])

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.card}>
        <div className={styles.content}>
          <MiniCard
            title={title}
            thumbnail={thumbnail}
            onClick={() => {
              setExpanded(true)
            }}
          />
          <ConfigProvider
            theme={{
              components: {
                Modal: {
                  contentBg: 'var(--primary)',
                }
              }
            }}
          >
            <Modal
              title={''}
              open={expanded}
              onClose={onClose}
              onCancel={onClose}
              footer={[
                // <Button key="back" onClick={onClose} type='primary'>Close</Button>
              ]}
            >
              <MaxCard
                title={title}
                thumbnail={thumbnail}
                chapters={chapters}
                isFav={isFavState}
                inReadingList={inReadingListState}
                onFav={onFav}
                onReadingList={onReadingList}
                favLoading={favLoading}
                readingLoading={readingLoading}
              />
            </Modal>
          </ConfigProvider>
        </div>
      </div>
    </div>
  )
}

export default Card