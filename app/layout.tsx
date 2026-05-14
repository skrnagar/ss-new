import type React from "react";
import { Suspense } from "react";
import "./globals.css";
import { ConditionalFooter } from "@/components/conditional-footer";
import { AuthProvider } from "@/contexts/auth-context";
import { ConversationProvider } from "@/contexts/conversation-context";
import { OnlinePresenceProvider } from "@/contexts/online-presence-context";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Manrope, Poppins } from "next/font/google";
import AuthRedirector from "./components/auth-redirector";
import { MobileNav } from "@/components/mobile-nav";
import { Analytics } from "@vercel/analytics/react";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { PwaRegister } from "@/components/pwa-register";

const ChatPanel = dynamic(
  () => import("@/components/chat-panel").then((m) => ({ default: m.ChatPanel })),
  { ssr: false }
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Safety Shaper - ESG & EHS Professional Network",
  description:
    "Connect with ESG and EHS professionals, share knowledge, find jobs, and manage compliance.",
  applicationName: "Safety Shaper",
  generator: "v0.dev",
  appleWebApp: {
    capable: true,
    title: "Safety Shaper",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
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
          <OnlinePresenceProvider>
            <ConversationProvider>
            <Suspense fallback={null}>
              <AuthRedirector />
            </Suspense>
            <div className="flex flex-col min-h-screen">
              <ConditionalNavbar />
              <div className="pb-16 md:pb-0">
                <main className="flex-grow">{children}</main>
                <ConditionalFooter />
              </div>
              {/* Mobile navigation - only visible on mobile devices */}
              <MobileNav />
            </div>
            {/* Chat Panel - floating in bottom right */}
            <ChatPanel />
          </ConversationProvider>
          </OnlinePresenceProvider>
        </AuthProvider>
        <Analytics />
        <PwaRegister />
      </body>
    </html>
  );
}
