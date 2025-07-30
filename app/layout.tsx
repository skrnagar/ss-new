import type React from "react";
import "./globals.css";
import { ConditionalFooter } from "@/components/conditional-footer";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Manrope, Poppins } from "next/font/google";
import { Home, Users, PlusSquare, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import AuthRedirector from "./components/auth-redirector";
import { MobileNav } from "@/components/mobile-nav";
import { Analytics } from "@vercel/analytics/react";
import { ChatPanel } from "@/components/chat-panel";

// Dynamically import Navbar with Suspense
const Navbar = dynamic(
  () => import("@/components/navbar").then((mod) => ({ default: mod.Navbar })),
  {
    ssr: true,
    loading: () => (
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="mr-2 h-9 w-9 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-8 bg-muted rounded-md animate-pulse"></div>
          </div>
        </div>
      </header>
    ),
  }
);

// Configure the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

// Configure the Manrope font
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Safety Shaper - ESG & EHS Professional Network",
  description:
    "Connect with ESG and EHS professionals, share knowledge, find jobs, and manage compliance.",
  generator: "v0.dev",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        url: '/favicon.ico',
      },
    ],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${manrope.className}`}>
        <AuthProvider>
          <AuthRedirector />
          <div className="flex flex-col min-h-screen">
            <Suspense
              fallback={
                <header className="sticky top-0 z-40 border-b bg-background">
                  <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="mr-2 h-9 w-9 bg-muted rounded-md animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-8 bg-muted rounded-md animate-pulse"></div>
                    </div>
                  </div>
                </header>
              }
            >
              <Navbar />
            </Suspense>
            <div className="pb-16 md:pb-0">
              <main className="flex-grow">{children}</main>
              <ConditionalFooter />
            </div>
            {/* Mobile navigation - only visible on mobile devices */}
              <MobileNav />
          </div>
          {/* Chat Panel - floating in bottom right */}
          <ChatPanel />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}