import {ReactNode} from 'react'

import styles from './CardContent.module.scss'

interface CardContentProps {
  title: string
  value: ReactNode | string
  icon?: ReactNode
  color?: string
}

const CardContent = ({title, value, icon, color}: CardContentProps) => {
  return (
    <div className={styles.card} style={{backgroundColor: 'var(--background)'}}>
      <div className={styles.content}>
        <div className={styles.icon} style={{color: `${color || '#000'}`}}>{icon || null}</div>
        <div className={styles.stats}>
          <div className={styles.title}>{title}</div>
          <div className={styles.value}>{value}</div>
        </div>
      </div>
    </div>
  )
}

export default CardContent