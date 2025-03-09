
"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import dynamic from "next/dynamic";
import "./globals.css";

// Dynamically import Navbar with loading fallback
const Navbar = dynamic(() => import("@/components/navbar").then(mod => mod.Navbar), {
  ssr: true,
  loading: () => <div className="h-16 border-b bg-background"></div>,
});

// Dynamically import Footer to reduce initial load
const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Safety Shaper: A professional network for ESG and EHS professionals"
        />
        <link rel="icon" href="/sslogo.webp" />
        <title>Safety Shaper</title>
      </head>
      <body className="min-h-screen bg-background">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
