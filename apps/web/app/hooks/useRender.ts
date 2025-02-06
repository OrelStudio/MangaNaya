import {useState, useCallback} from 'react'

const useRender = () => {
  const [, setBool] = useState(false)

  const forceRender = useCallback(() => {
    setBool((bool) => !bool)
  }, [])

  return forceRender
}

export default useRender
