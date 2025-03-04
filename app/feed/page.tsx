import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function FeedPage() {
  // Verify the user is authenticated server-side
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login?redirectUrl=/feed')
  }

  // Now we know the user is authenticated
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>

      <div className="bg-card rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Welcome, {profile?.name || session.user.email}</h2>
        <p className="text-muted-foreground">
          This is your personalized feed where you'll see updates from your network and relevant industry news.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Feed content would go here */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
              <div>
                <h3 className="font-semibold">Sample Post Author</h3>
                <p className="text-sm text-muted-foreground">ESG Consultant at Company</p>
              </div>
            </div>
            <p className="mb-4">
              This is an example post that would appear in your feed. It could be an article, question, or update from someone in your network.
            </p>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>Like • Comment • Share</div>
              <div>2 hours ago</div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
              <div>
                <h3 className="font-semibold">Another Sample Author</h3>
                <p className="text-sm text-muted-foreground">Health & Safety Manager</p>
              </div>
            </div>
            <p className="mb-4">
              Here's another example post showing what content might look like in the feed.
            </p>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>Like • Comment • Share</div>
              <div>5 hours ago</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Suggested Connections</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-muted mr-3"></div>
                <div className="flex-1">
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-xs text-muted-foreground">EHS Director</p>
                </div>
                <button className="text-xs text-primary font-medium">Connect</button>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-muted mr-3"></div>
                <div className="flex-1">
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Sustainability Lead</p>
                </div>
                <button className="text-xs text-primary font-medium">Connect</button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Trending Topics</h3>
            <div className="space-y-2">
              <p className="text-sm">#SustainableDevelopment</p>
              <p className="text-sm">#WorkplaceSafety</p>
              <p className="text-sm">#ESGReporting</p>
              <p className="text-sm">#ClimateAction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}