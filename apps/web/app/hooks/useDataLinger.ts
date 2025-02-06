import {useRef} from 'react'

/**
 * @description A hook that takes a value and returns it only if it is not null or undefined
 * The first initial value is returned even if it is null or undefined
 * @param {T} value - The value to linger
 * @returns {T} The value that is not null or undefined
 * except for the first initial value
 * which can return null or undefined if provided as the initial value
 */
const useDataLinger = <T>(value: T) => {
  const ref = useRef(value)

  if (value) {
    ref.current = value
  }

  return ref.current
}

export default useDataLinger
