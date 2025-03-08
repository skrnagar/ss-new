
'use client'

import React from 'react'

/**
 * Custom hook to create a memoized component that only re-renders when props change
 * @param Component The component to memoize
 * @returns A memoized version of the component
 */
export function useMemoComponent<T extends React.ComponentType<any>>(
  Component: T
): T {
  return React.memo(Component) as T
}
