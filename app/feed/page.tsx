"use client"

import { useState, useEffect, Suspense } from "react"
import { unstable_serialize } from 'swr'
import ErrorBoundary from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  User,
  MapPin,
  Briefcase,
  Clock,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
const PostCreator = dynamic(() => import("@/components/post-creator"), { 
  ssr: false,
  loading: () => <div className="p-6 bg-muted/30 rounded-md animate-pulse"></div>
})
const PostItem = dynamic(() => import("@/components/post-item"), { 
  ssr: false,
  loading: () => <div className="p-6 bg-muted/30 rounded-md animate-pulse"></div>
})
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile: userProfile, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)

        // Fetch posts with user information
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profile:user_id (
              id,
              username,
              full_name,
              avatar_url,
              position,
              company
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          throw error
        }

        if (data) {
          setPosts(data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
      }, async (payload) => {
        // When a new post is created, fetch its user data as well
        const { data: newPostWithUser } = await supabase
          .from('posts')
          .select(`
            *,
            profile:user_id (
              id,
              username,
              full_name,
              avatar_url,
              position,
              company
            )
          `)
          .eq('id', payload.new.id)
          .single()

        if (newPostWithUser) {
          setPosts(prevPosts => [newPostWithUser, ...prevPosts])
        }
      })
      .subscribe()

    return () => {
      postsSubscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Post creation card */}
          {userProfile ? (
            <PostCreator userProfile={userProfile} />
          ) : user?.id ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground mb-2">Complete your profile to start posting</p>
                <Button onClick={() => router.push('/profile/setup')}>
                  Set Up Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground mb-2">Sign in to create posts and interact with the community</p>
                <Button onClick={() => router.push('/auth/login')}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Posts list */}
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[160px]" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-[200px] w-full rounded-md" />
                </CardContent>
              </Card>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <ErrorBoundary key={post.id}>
                <PostItem post={post} currentUser={userProfile} />
              </ErrorBoundary>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-xl font-medium mb-2">No posts yet</p>
                <p className="text-muted-foreground">
                  Be the first to share something with the community!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden md:block space-y-6">
          <Card>
            <CardContent className="pt-6">

              {userProfile ? (
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={userProfile.avatar_url || ""} alt={userProfile.full_name || "User"} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium">{userProfile.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{userProfile.headline || "No headline"}</p>

                  <div className="w-full mt-4">
                    {userProfile.position && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{userProfile.position}</span>
                      </div>
                    )}
                    {userProfile.company && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{userProfile.company}</span>
                      </div>
                    )}
                    {userProfile.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        <span>{userProfile.location}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-3" 
                    variant="outline"
                    onClick={() => router.push(`/profile/${userProfile.username}`)}
                  >
                    View Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">
                    Sign in to access your profile and all features
                  </p>
                  <Button onClick={() => router.push('/auth/login')}>
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Tomorrow, 3:00 PM</span>
                  </div>
                  <h4 className="font-medium">ESG Reporting Best Practices</h4>
                  <p className="text-sm text-muted-foreground">
                    Join industry experts for a webinar on ESG reporting standards
                  </p>
                </div>

                <div className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">May 15, 2:00 PM</span>
                  </div>
                  <h4 className="font-medium">Workplace Safety Forum</h4>
                  <p className="text-sm text-muted-foreground">
                    Virtual panel discussion on improving safety culture
                  </p>
                </div>

                <Button variant="link" className="px-0">See all events</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Suggested Connections</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">James Peterson</p>
                      <p className="text-xs text-muted-foreground">Safety Director at Construct Co.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Maria Johnson</p>
                      <p className="text-xs text-muted-foreground">ESG Analyst at Green Metrics</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>RL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Robert Lee</p>
                      <p className="text-xs text-muted-foreground">EHS Manager at Industrial Tech</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <Button variant="link" className="px-0">See more suggestions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}