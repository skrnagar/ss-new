import type React from "react";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import { Manrope, Poppins } from "next/font/google";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} ${manrope.className}`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

import "./globals.css";
