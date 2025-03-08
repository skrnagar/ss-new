
import { useState, useEffect } from 'react'

// Debounce function to limit resize calculations
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function useMobile(breakpoint = 768): boolean {
  // Default to non-mobile for SSR
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    
    // Debounced resize handler
    const debouncedResize = debounce(checkMobile, 100)
    
    // Set initial value
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', debouncedResize)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', debouncedResize)
    }
  }, [breakpoint])
  
  return isMobile
}
