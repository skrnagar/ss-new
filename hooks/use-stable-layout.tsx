
"use client"

import { useLayoutEffect, useState } from 'react'

export function useStableLayout() {
  const [isLayoutStable, setIsLayoutStable] = useState(false)
  
  useLayoutEffect(() => {
    // Set layout as stable after initial render
    setIsLayoutStable(true)
    
    // Report CLS to analytics if needed
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      import('web-vitals').then(({ getCLS }) => {
        getCLS(console.log)
      })
    }
  }, [])
  
  return isLayoutStable
}
