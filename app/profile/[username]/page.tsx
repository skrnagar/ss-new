"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Briefcase, MapPin, Calendar, Edit, MessageSquare, UserPlus } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { ProfileEditor } from '@/components/profile-editor'
import { PostItem } from '@/components/post-item'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        // Get profile by username
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single()

        if (error || !profileData) {
          console.error('Profile error:', error)
          router.push('/404')
          return
        }

        setProfile(profileData)
        setIsOwnProfile(user?.id === profileData.id)

        // Fetch user's posts for activity
        await fetchUserActivity(profileData.id)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfile()
    }
  }, [username, router])

  const fetchUserActivity = async (userId: string) => {
    setActivityLoading(true)
    try {
      // Fetch user's posts
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching user posts:', error)
        return
      }

      setUserPosts(posts || [])
    } catch (error) {
      console.error('Error in fetchUserActivity:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    setEditing(false)
    // Refetch profile data
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()

    if (updatedProfile) {
      setProfile(updatedProfile)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="mb-6">The profile you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/feed')}>Return to Feed</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.name} />
                <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{profile.name || "Anonymous User"}</h1>
                {profile.username && (
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>
                )}

                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 mt-2">
                  {profile.position && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{profile.position}</span>
                    </div>
                  )}

                  {profile.company && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{profile.company}</span>
                    </div>
                  )}

                  {profile.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setEditing(!editing)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>{editing ? "Cancel" : "Edit Profile"}</span>
                  </Button>
                ) : (
                  <>
                    <Button variant="default" size="sm" className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" />
                      <span>Connect</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Message</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bio/Edit Section */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editing ? "Edit Profile" : "About"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <ProfileEditor profile={profile} onUpdate={handleProfileUpdate} />
                ) : (
                  <>
                    {profile.bio ? (
                      <p className="whitespace-pre-line">{profile.bio}</p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        {isOwnProfile ? "Add a bio to tell others about yourself." : "No bio available."}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Section */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <PostItem 
                        key={post.id} 
                        post={post} 
                        currentUserId={currentUser?.id}
                        onUpdate={() => fetchUserActivity(profile.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity to display</p>
                    {isOwnProfile && (
                      <Button variant="link" onClick={() => router.push('/feed')}>
                        Share your first post
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}