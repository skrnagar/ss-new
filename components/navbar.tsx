"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Briefcase, BookOpen, Users, Bell, MessageSquare, Menu, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="hidden font-bold text-xl text-primary sm:inline-block">Safety Shaper</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search professionals, jobs, resources..." className="pl-8 w-full" />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/"
            className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            href="/jobs"
            className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Briefcase className="h-5 w-5" />
            <span>Jobs</span>
          </Link>
          <Link
            href="/knowledge"
            className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <BookOpen className="h-5 w-5" />
            <span>Knowledge</span>
          </Link>
          <Link
            href="/groups"
            className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Users className="h-5 w-5" />
            <span>Groups</span>
          </Link>
          <Link
            href="/notifications"
            className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </Link>
          <Link
            href="/messages"
            className="flex flex-col items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="secondary" className="hidden md:flex">
            Join Now
          </Button>
          <Button variant="ghost" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search professionals, jobs, resources..." className="pl-8 w-full" />
            </div>
            <nav className="grid grid-cols-3 gap-4">
              <Link
                href="/"
                className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <Home className="h-5 w-5 mb-1" />
                <span>Home</span>
              </Link>
              <Link
                href="/jobs"
                className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <Briefcase className="h-5 w-5 mb-1" />
                <span>Jobs</span>
              </Link>
              <Link
                href="/knowledge"
                className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <BookOpen className="h-5 w-5 mb-1" />
                <span>Knowledge</span>
              </Link>
              <Link
                href="/groups"
                className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <Users className="h-5 w-5 mb-1" />
                <span>Groups</span>
              </Link>
              <Link
                href="/notifications"
                className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <Bell className="h-5 w-5 mb-1" />
                <span>Notifications</span>
              </Link>
              <Link
                href="/messages"
                className="flex flex-col items-center p-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <MessageSquare className="h-5 w-5 mb-1" />
                <span>Messages</span>
              </Link>
            </nav>
            <div className="mt-4">
              <Button variant="secondary" className="w-full">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

