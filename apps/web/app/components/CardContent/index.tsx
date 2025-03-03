import {ReactNode} from 'react'
import {Card, ConfigProvider} from 'antd'

import styles from './CardContent.module.scss'

interface CardContentProps {
  title: string
  value: ReactNode | string
  icon?: ReactNode
  color?: string
}

const CardContent = ({title, value, icon, color}: CardContentProps) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            colorBgContainer: 'var(--background)'
          }
        }
      }}
    >
      <Card className={styles.card}>
        <div className={styles.content}>
          <div className={styles.icon} style={{color: `${color || '#000'}`}}>{icon || null}</div>
          <div className={styles.stats}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
          </div>
        </div>
      </Card>
    </ConfigProvider>
  )
}

export default CardContent