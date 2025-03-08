'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PostItem from '@/components/post-item'
import PostCreator from '@/components/post-creator'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const { user, profile: userProfile, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Set authChecked when auth status is known
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true)
    }
  }, [authLoading])

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/auth/login')
      return
    }

    // Function to fetch posts
    async function fetchPosts() {
      try {
        setIsLoading(true)
        // Get posts with user profiles
        const { data: postsData, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching posts:', error)
          return
        }

        // For each post, get the likes count
        const postsWithLikes = await Promise.all(
          postsData.map(async (post) => {
            const { count } = await supabase
              .from('likes')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id)

            return {
              ...post,
              likes_count: count || 0,
            }
          })
        )

        setPosts(postsWithLikes)
      } catch (error) {
        console.error('Error in fetchPosts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        // When a new post is added, fetch the user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.new.user_id)
          .single()
          .then(({ data: profile }) => {
            // Add the new post with profile to the state
            const newPost = {
              ...payload.new,
              profiles: profile,
              likes_count: 0,
            }
            setPosts((prevPosts) => [newPost, ...prevPosts])
          })
      })
      .subscribe()

    return () => {
      postsSubscription.unsubscribe()
    }
  }, [supabase, user, router, authLoading])

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="container py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Feed</h1>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Post creator section */}
            {userProfile ? (
              <PostCreator userProfile={userProfile} />
            ) : user ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground mb-2">Complete your profile to start posting</p>
                  <Button asChild>
                    <Link href="/profile/setup">Complete Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {/* Posts list */}
            {isLoading && authChecked ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-4 text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostItem key={post.id} post={post} currentUser={userProfile} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-xl mb-2">No posts yet</p>
                  <p className="text-muted-foreground mb-6">Be the first to share something with the community</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="following">
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">Following feed coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular">
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">Popular posts feed coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}