import type React from "react";
import "./globals.css";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Manrope, Poppins } from "next/font/google";
import { Home, Users, PlusSquare, BookOpen, GraduationCap } from "lucide-react";
import { Suspense } from "react";

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
};

//New MobileNav Component
const MobileNav = () => {
  return (
    <nav className="bg-white fixed bottom-0 w-full border-t md:hidden">
      <ul className="flex justify-around p-2">
        <li className="flex flex-col items-center">
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </li>
        <li className="flex flex-col items-center">
          <Users className="w-5 h-5 mb-1" />
          <span className="text-xs">Network</span>
        </li>
        <li className="flex flex-col items-center">
          <PlusSquare className="w-5 h-5 mb-1" />
          <span className="text-xs">Post</span>
        </li>
        <li className="flex flex-col items-center">
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-xs">Knowledge</span>
        </li>
        <li className="flex flex-col items-center">
          <GraduationCap className="w-5 h-5 mb-1" />
          <span className="text-xs">Learning</span>
        </li>
      </ul>
    </nav>
  );
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
            <div className="pb-16 md:pb-0"> {/* Added padding to avoid overlap */}
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <MobileNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}