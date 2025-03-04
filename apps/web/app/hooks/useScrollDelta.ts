import {useEffect} from 'react'

const useScrollDelta = (callback: (delta: number) => void) => {
  useEffect(() => {
    let lastScroll = window.scrollY

    const onScroll = () => {
      const currentScroll = window.scrollY
      const diff = currentScroll - lastScroll

      if (diff !== 0) {
        callback(diff)
        lastScroll = currentScroll
      }
    }

    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  })
}

export default useScrollDelta