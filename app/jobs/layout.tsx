
import { ProtectedRoute } from "@/components/protected-route"

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
