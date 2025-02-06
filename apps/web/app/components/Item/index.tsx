import Link from 'next/link'
import Image from 'next/image'
import timeAgo from './timeAgo'

import {ClockOutlined} from '../Icon'

import styles from './Item.module.scss'

interface ItemProps {
  src: string
  alt: string
  url: string
  title?: string
  subtitle?: string
  time?: number
}

const Item = ({src, alt, url, title, subtitle, time}: ItemProps) => {
  return (
    <div className={styles.item}>
      <div className={styles.image} style={(title && subtitle && time) ? {marginRight: '12px'} : {}}>
        <Link href={url} passHref>
          <Image src={src} alt={alt} width={100} height={150} />
        </Link>
      </div>
      {(title && subtitle && time) && (
        <div className={styles.info}>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{`Chapter ${subtitle}`}</div>
          <div className={styles.time}>
            <div className={styles.clock}><ClockOutlined /></div>
            {timeAgo(time)}
          </div>
        </div>
      )}
    </div>
  )
}

export default Item