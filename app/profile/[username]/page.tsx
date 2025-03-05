import { createLegacyClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const revalidate = 3600 // Revalidate the data at most every hour

export default async function UserProfilePage({
  params
}: {
  params: { username: string }
}) {
  const supabase = createLegacyClient()

  // Get the username from the URL params
  const { username } = params

  // Get current session
  const { data: { session } } = await supabase.auth.getSession()

  try {
    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      // If the error is specifically a 404 on the table, we need to create it
      if (error.code === '404' || error.message.includes('does not exist')) {
        // Try to set up the database tables
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/setup-db`)
        notFound()
      } else {
        notFound()
      }
    }

    if (!profile) {
      notFound()
    }

    // Check if current user is viewing their own profile
    const isOwnProfile = session?.user.id === profile.id

    // Helper function to get initials
    const getInitials = (name: string) => {
      if (!name) return 'U'
      return name
        .split(' ')
        .map(part => part?.[0] || '')
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }

    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Profile sidebar */}
          <div className="md:col-span-1">
            <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.full_name} />
                  <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                </Avatar>

                <h1 className="text-2xl font-bold">{profile.full_name}</h1>

                {profile.headline && (
                  <p className="text-muted-foreground mb-4">{profile.headline}</p>
                )}

                {isOwnProfile && (
                  <div className="mt-4 w-full">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/profile/setup">Edit Profile</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            <div className="rounded-lg border bg-card text-card-foreground shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                {profile.bio ? (
                  <p className="whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    {isOwnProfile
                      ? "You haven't added any information to your bio yet. Edit your profile to add one."
                      : `${profile.full_name} hasn't added any information to their bio yet.`}
                  </p>
                )}
              </div>
            </div>

            {/* Additional sections can be added here */}
          </div>
        </div>
      </div>
    )
  } catch (err) {
    console.error('Unexpected error loading profile:', err)
    notFound()
  }
}