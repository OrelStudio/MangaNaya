import Image from 'next/image'
import {Skeleton} from 'antd'

import styles from './Manga.module.scss'

interface MangaProps {
  loading: boolean
  thumbnail: string
  name: string
  description: string
  genres: string[]
}

const Manga = ({loading, thumbnail, name, description, genres}: MangaProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.thumbnail}>
        {loading ? (
          
          <Skeleton.Input style={{width: '500px', height: '500px'}} active />
        ) : (
          <Image
            src={thumbnail}
            alt={name}
            fill
            sizes="(max-width: 600px) 100vw, 500px"
          />
        )}
      </div>
      <div className={styles.details}>
        <div className={styles.title}>
          {loading ? (
            
            <Skeleton.Input style={{width: '500px'}} active />
          ) : (
            <span>{name}</span>
          )}
        </div>
        {loading ? (
          
          <Skeleton.Input style={{width: '500px', height: '80px', marginTop: '10px'}} active />
        ) : (
          <div className={styles.description}>
            <span>{description}</span>
          </div>
        )}
        <div className={styles.genres}>
          {!loading && genres.map((genre: string, i: number) => (
            <span key={i}>{genre}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Manga