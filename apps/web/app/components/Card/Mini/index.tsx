import Image from 'next/image'

import styles from './Mini.module.scss'

interface MiniCardProps {
  title: string
  thumbnail: string
  onClick: () => void
}

const MiniCard = ({title, thumbnail, onClick}: MiniCardProps) => {
  return (
    <div className={styles.mini} onClick={onClick}>
      <div className={styles.title}>
        <span>{title.slice(0, 27)}</span>
      </div>
      <div className={styles.thumbnail}>
        <Image
          src={thumbnail}
          alt={title}
          width={200}
          height={200}
        />
      </div>
    </div>
  )
}

export default MiniCard