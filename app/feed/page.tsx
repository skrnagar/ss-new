import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"

export default async function FeedPage() {
  // Server-side auth check
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-lg shadow p-4">
          <p>Welcome to your feed! This is a protected page that only authenticated users can see.</p>
          <p className="mt-2">You are signed in as: {session.user.email}</p>
        </div>
      </div>
    </div>
  )
}