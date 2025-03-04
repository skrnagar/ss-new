
"use client"

import { ProtectedRoute } from "@/components/protected-route"

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
