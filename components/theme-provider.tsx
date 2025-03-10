
"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Only render theme provider on client side
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash by rendering children without provider before mounting
  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
