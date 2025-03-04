'use client'

import { useState, useEffect } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add listener for window resize
    window.addEventListener('resize', checkMobile)

    // Clean up
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Export an alias to maintain compatibility with existing code
export const useMobile = useIsMobile