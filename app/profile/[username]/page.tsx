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

  // Get profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return notFound()
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
}
import { redirect } from "next/navigation"
import { createLegacyClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Briefcase, MapPin, Calendar, Edit, MessageSquare, UserPlus, User } from "lucide-react"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params
  const supabase = createLegacyClient()

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Get profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (error || !profile) {
    // Profile not found
    redirect("/404")
  }

  // Check if viewing own profile
  const isOwnProfile = session?.user.id === profile.id

  // Format date for display
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.full_name} />
                  <AvatarFallback>
                    {profile.full_name?.split(" ").map((n: string) => n[0]).join("") || username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <p className="text-muted-foreground text-center">{profile.headline}</p>
                
                <div className="w-full flex gap-2 mt-4">
                  {isOwnProfile ? (
                    <Button className="w-full" asChild>
                      <a href="/profile/setup">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </a>
                    </Button>
                  ) : (
                    <>
                      <Button className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.company && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {profile.position ? `${profile.position} at ` : "Works at "}
                      {profile.company}
                    </p>
                  </div>
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{profile.location}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Joined {joinDate}</p>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">@{profile.username}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  {isOwnProfile ? "Add a bio to tell others about yourself." : "No bio available."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity to display</p>
                {isOwnProfile && (
                  <Button variant="link" asChild>
                    <a href="/feed">Share your first post</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
