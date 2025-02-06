import {useCallback} from 'react'
import {StarOutlined, StarFilled, BookmarkOutlined, BookmarkFilled} from '../Icon'
import styles from './ActionButton.module.scss'

const icons = {
  star: {
    outlined: <StarOutlined />,
    filled: <StarFilled />
  },
  bookmark: {
    outlined: <BookmarkOutlined />,
    filled: <BookmarkFilled />
  }
}

interface ActionButtonProps {
  icon: 'star' | 'bookmark'
  active?: boolean
  onClick: () => void
  loading?: boolean
}

const ActionButton = ({icon, active, onClick, loading}: ActionButtonProps) => {
  const onClickHandler = useCallback(() => {
    if (loading) return
    onClick()
  }, [])

  return (
    <div className={`${styles.icon} ${active ? styles.active : ''} ${loading ? styles.disabled : ''}`} onClick={onClickHandler}>
      {icons[icon][active ? 'filled' : 'outlined']}
    </div>
  )
}

export default ActionButton