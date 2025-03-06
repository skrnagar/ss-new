
import { createLegacyClient } from "@/lib/supabase-server"
import { PostCreator } from "@/components/post-creator"
import { ProtectedRoute } from "@/components/protected-route"
import { Metadata } from "next"
import { LazyFeed } from "./lazy-feed"

export const metadata: Metadata = {
  title: "Feed | Safety Shaper",
  description: "Stay updated with the latest posts from safety professionals.",
}

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = createLegacyClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch initial batch of posts with profile information
  const { data: initialPosts } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(id, username, full_name, headline, position, company, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <ProtectedRoute>
      <div className="container py-6 max-w-3xl">
        <div className="mb-6">
          <PostCreator userProfile={user?.user_metadata || {}} />
        </div>

        <LazyFeed initialPosts={initialPosts || []} currentUser={user || null} />
      </div>
    </ProtectedRoute>
  )
}
