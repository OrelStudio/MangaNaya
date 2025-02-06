import {useQuery, gql} from '@apollo/client'

import CardContent from '../components/CardContent'
import {FireOutlined} from '@ant-design/icons'
import {BookOpenOutlined, BookOutlined, ChartColumnOutlined} from '../components/Icon'
import Genres from '../components/Genres'

import styles from './Stats.module.scss'

interface StatsProps {
  userId: number
}

const GET_STATS = (userId: number) => gql`
  query Stats {
    stats(userId: ${userId}) {
      total_manga_read
      total_chapters_read
      top_genres
      reading_streak
    }
  }
`

const Stats = ({userId}: StatsProps) => {
  const {data} = useQuery(GET_STATS(userId))

  if (!data) {
    return null
  }
  
  return (
    <div className={styles.stats}>
      <CardContent
        title='Reading Streak'
        value={data.stats.reading_streak}
        
        icon={<FireOutlined />}
        color='#e74c3c'
      />
      <CardContent
        title='Total Manga Read'
        value={data.stats.total_manga_read}
        
        icon={<BookOpenOutlined />}
        color='#3b82f6'
      />
      <CardContent
        title='Total Chapters Read'
        value={data.stats.total_chapters_read}
        
        icon={<BookOutlined />}
        color='#2ecc71'
      />
      <CardContent
        title='Top Genres'
        value={<Genres genres={data.stats.top_genres} />}
        
        icon={<ChartColumnOutlined />}
        color='#6b21a8'
      />
    </div>
  )
}

export default Stats