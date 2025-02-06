import Image from 'next/image'

import styles from './Panel.module.scss'

interface PanelProps {
  chapterId: number
  index: number
}

const Panel = ({chapterId, index}: PanelProps) => {
  return (
    <div className={styles.panel}>
      <Image
        src={`${process.env.IMG_URL}/panel/${chapterId}?i=${index}`}
        alt={`panel-${index}`}
        width={500}
        height={500}
      />
    </div>
  )
}

export default Panel