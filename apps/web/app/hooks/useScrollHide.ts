import {useState, useCallback} from 'react'
import useScrollDelta from './useScrollDelta'

const useScrollHide = (): number => {
  const [scrollY, setScrollY] = useState(0) // 0 min, 100 max

  /**
   * @param {number} scrollY - the amount of scroll, negative for down, positive for up
   */
  const setScroll = useCallback((scrollAmount: number) => (
    setScrollY((prev) => scrollAmount < 0 ? Math.max(0, prev + scrollAmount) : Math.min(200, prev + scrollAmount))
  ), [])

  useScrollDelta(setScroll)

  // threshold for showing the header at the bottom of the page
  return window.innerWidth > 1175 ? 0 : scrollY
}

export default useScrollHide