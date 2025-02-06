import {useMemo} from 'react'
import usePrevious from '../hooks/usePrevious'
import useDataLinger from '../hooks/useDataLinger'

import styles from './Read.module.scss'

interface TitleProps {
  name: string
  number: number
}

const Title = ({name, number}: TitleProps) => {
  const prevName = useDataLinger(usePrevious(name))
  const prevNumber = useDataLinger(usePrevious(number))

  const currentName = useMemo(() => name || prevName, [name, prevName])
  const currentNumber = useMemo(() => number || prevNumber, [number, prevNumber])

  if (!currentName && !currentNumber) {
    return null
  }

  return (
    <div className={styles.title}>
      <span className={styles.name}>{currentName}</span>
      <span className={styles.number}>Chapter {currentNumber}</span>
    </div>
  )
}

export default Title