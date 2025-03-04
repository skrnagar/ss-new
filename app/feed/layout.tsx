
import { ProtectedRoute } from "@/components/protected-route"

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
