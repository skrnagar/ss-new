'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  
  // Only render theme provider on client side
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Prevent flash by rendering placeholder before mounting
  if (!mounted) {
    return <>{children}</>
  }
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
