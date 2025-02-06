import {RefObject, useEffect} from 'react'

const useWheelScroll = (ref: RefObject<HTMLElement | null>) => {
  // Scroll horizontally
  useEffect(() => {
    const onScroll = (e: WheelEvent) => {
      if (!ref.current) {
        return
      }
      e.preventDefault()
      
      ref.current.scrollBy({
        left: e.deltaY * 2,
        behavior: 'smooth'
      })
    }

    ref.current?.addEventListener('wheel', onScroll)

    return () => {
      ref.current?.removeEventListener('wheel', onScroll)
    }
  }, [ref.current])
}

export default useWheelScroll