'use client'

import {useEffect, useRef} from 'react'

/**
 * @description A hook that returns the previous value of given value
 * @param {T} value - The value
 * @returns {T} Previous value
 */
const usePrevious = <T>(value: T) => {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

export default usePrevious
