import {useState, useEffect} from 'react'
import {useQuery, gql} from '@apollo/client'
import usePolling from './usePolling'

const SearchData = (query: string) => gql`
  query Search {
    search(query: "${query}") {
      id
      name
      thumbnail
      genres
      description
      chapters {
        id
        manga_id
        chapter_number
        available
        length
      }
    }
  }
`

const useSearch = (query: string) => {
  const {loading, error, data, refetch} = useQuery(SearchData(query))
  const [shouldPoll, setShouldPoll] = useState(false)

  useEffect(() => {
    const canPoll = error?.message.includes('Requested') && query.trim() !== ''

    if (!canPoll) {
      setShouldPoll(false)
      return
    }

    setShouldPoll(true)

    const timer = setTimeout(() => {
      setShouldPoll(false)
    }, 15000)

    return () => clearTimeout(timer)
  }, [error, query])

  usePolling({
    shouldPoll,
    pollFn: refetch,
    interval: 10000
  })

  return {
    loading: error?.message.includes('requested') || loading,
    error,
    data: data?.search ?? null
  }
}

export default useSearch