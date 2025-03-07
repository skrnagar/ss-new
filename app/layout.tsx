import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Poppins, Manrope } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

// Configure the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
})

// Configure the Manrope font
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Safety Shaper - ESG & EHS Professional Network",
  description: "Connect with ESG and EHS professionals, share knowledge, find jobs, and manage compliance.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} ${manrope.className}`}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}



import './globals.css'