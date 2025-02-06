import {useCallback, useRef} from 'react'

/**
 * @description A hook that debounces a function
 * @param {T} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function
 */
// eslint-disable-next-line no-unused-vars
const useDebounced = <T extends (...args: any[]) => void>(callback: T, delay: number) => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback((...args: Parameters<T>) => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    timeout.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])
}

export default useDebounced
