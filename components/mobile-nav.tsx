"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusSquare, BookOpen, GraduationCap } from "lucide-react";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/network", icon: Users, label: "Network" },
  { href: "/posts/create", icon: PlusSquare, label: "Post" },
  { href: "/knowledge", icon: BookOpen, label: "Knowledge" },
  { href: "/learning", icon: GraduationCap, label: "Learning" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white fixed bottom-0 w-full border-t md:hidden">
      <ul className="flex justify-around p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center w-16 ${
                  isActive ? "text-primary" : "text-gray-500"
                } hover:text-primary transition-colors`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}