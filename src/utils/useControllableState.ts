import { useCallback, useRef, useState } from 'react'

/**
 * One state hook for components that work either controlled or uncontrolled.
 * Pass `value` to control it; omit it and the component keeps its own state
 * while still reporting every change through `onChange`.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void
): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue)
  const isControlled = value !== undefined
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [isControlled]
  )

  return [isControlled ? (value as T) : internal, set]
}
