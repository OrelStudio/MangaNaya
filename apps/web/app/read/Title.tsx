import {useMemo} from 'react'
import {Skeleton} from 'antd'
import usePrevious from '../hooks/usePrevious'
import useDataLinger from '../hooks/useDataLinger'

import styles from './Read.module.scss'

interface TitleProps {
  name: string
  number: number
}

const Title = ({name, number}: TitleProps) => {
  const prevName = useDataLinger(usePrevious(name))

  const currentName = useMemo(() => name || prevName, [name, prevName])

  if (!currentName) {
    return null
  }

  return (
    <div className={styles.title}>
      <span className={styles.name}>{currentName}</span>
      {number ? (
        <span className={styles.number}>Chapter {number}</span>
      ) : (
        <Skeleton.Input style={{width: 100}} active />
      )}
    </div>
  )
}

export default Title