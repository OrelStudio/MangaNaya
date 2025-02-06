import React, {useEffect, useCallback} from 'react'

/**
 * @description Hook that listens for clicks outside an element
 * @param {React.RefObject<HTMLElement>} ref - The reference to the element
 * @param callback - The function to call when a click is detected outside the element
 */
const useOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  const onClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      // Clicked outside the element
      callback()
    }
  }, [ref, callback])

  useEffect(() => {
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [onClick])
}

export default useOutside
