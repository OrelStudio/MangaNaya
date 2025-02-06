import {useState, useCallback, useRef, useEffect} from 'react'
import useSearch from '../../hooks/useSearch'
import useDebounced from '../../hooks/useDebounced'
import {SearchOutlined} from '@ant-design/icons'
import Input from '../Input'

import type {MangaTypeDB, ChaptersQL} from '@manga-naya/types'

import styles from './Search.module.scss'

type MangaType = MangaTypeDB & {
  chapters: ChaptersQL[]
}

interface SearchProps {
  initialSearch?: string
  // eslint-disable-next-line no-unused-vars
  onChange?: (results: MangaType[], value: string, loading: boolean) => void
}

const Search = ({initialSearch, onChange}: SearchProps) => {
  const [search, setSearch] = useState(initialSearch || '')
  const [searchQuery, setSearchQuery] = useState(initialSearch || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounced((query: string) => {
    setSearchQuery(query)
  }, 1000)

  const onChangeHandler = useCallback(() => {
    if (!inputRef.current) {
      return
    }
    const val = inputRef.current.value
    setSearch(val)
    debouncedSearch(val)
  }, [search])

  // eslint-disable-next-line no-unused-vars
  const {loading, error, data} = useSearch(searchQuery)

  useEffect(() => {
    if (onChange && data) {
      onChange(data, search, loading)
    }
  }, [data])

  return (
    <div className={styles.search}>
      {/* ignore ts error with the icon, it works perfectly fine */}
      
      <Input type="text" placeholder="Search..." icon={<SearchOutlined />} value={search} onChange={onChangeHandler} ref={inputRef} />
    </div>
  )
}

export default Search