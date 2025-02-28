import {useEffect, useState} from 'react'
import {useQuery, gql} from '@apollo/client'
import usePolling from './usePolling'

const SearchData = (id: number) => gql`
  query Chapter {
    chapter(id: ${id}) {
      id
      manga_id
      manga_name
      chapter_number
      available
      length
    }
  }
`

const useChapter = (id: number) => {
  const {loading, error, data, refetch} = useQuery(SearchData(id))
  const [shouldPoll, setShouldPoll] = useState(false)
  
  useEffect(() => {
    const canPoll = error?.message.includes('Requested')

    if (!canPoll) {
      setShouldPoll(false)
      return
    }

    setShouldPoll(true)

    const timer = setTimeout(() => {
      setShouldPoll(false)
      // 5 minutes
    }, 300000)

    return () => clearTimeout(timer)
  }, [error])

  usePolling({
    shouldPoll,
    pollFn: refetch,
    interval: 5000
  })

  return {
    loading: error?.message.includes('requested') || loading,
    error,
    data: data?.chapter ?? null
  }
}

export default useChapter