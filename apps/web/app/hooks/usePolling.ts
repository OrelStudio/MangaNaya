import {useEffect} from 'react'

interface UsePollingProps {
  shouldPoll: boolean
  pollFn: () => void
  interval?: number
}

const usePolling = ({
  shouldPoll,
  pollFn,
  interval = 2000,
}: UsePollingProps) => {
  useEffect(() => {
    if (!shouldPoll) {
      return
    }

    const timer = setInterval(() => {
      pollFn()
    }, interval)

    // Clear the timer when `shouldPoll` becomes false
    // or component unmounts
    return () => clearInterval(timer)
  }, [shouldPoll, pollFn, interval])
}

export default usePolling