
import { ProtectedRoute } from "@/components/protected-route"

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
