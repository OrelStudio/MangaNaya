/* eslint-disable no-unused-vars */
import { useCallback, useRef } from 'react'
import usePrevious from './usePrevious'
import useRender from './useRender'

const shallowCompareArrays = <T>(a: T[], b: T[]): boolean => {
  return a.length === b.length && a.every((element, index) => element === b.at(index))
}

const useDerivedState = <T>(
  initialState: T,
  updater: (prevState: T) => T | T,
  dependencies: any[] = []
): [T, (state: T | ((prevState: T) => T)) => void] => {
  const value = useRef<T>(initialState)
  const previousDependencies = usePrevious(dependencies)
  const forceRender = useRender()

  if (!shallowCompareArrays(previousDependencies, dependencies) && typeof updater === 'function') {
    value.current = updater(value.current)
  }

  const setState = useCallback((state: T | ((prevState: T) => T)) => {
    if (typeof state === 'function') {
      value.current = (state as (prevState: T) => T)(value.current)
    } else {
      value.current = state
    }

    forceRender()
  }, [...dependencies, value.current])

  return [value.current, setState]
}

export default useDerivedState
