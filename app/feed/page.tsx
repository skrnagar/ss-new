"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PostCreator } from "@/components/post-creator"
import { PostItem } from "@/components/post-item"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observer = useRef()
  const { toast } = useToast()

  const POSTS_PER_PAGE = 5

  // Get current user on page load
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setCurrentUser(data.user)
      }
    }
    fetchUser()
  }, [])

  // Fetch initial posts
  useEffect(() => {
    fetchPosts(0)
  }, [])

  // Intersection observer for infinite scroll with improved performance
  const lastPostElementRef = useCallback(node => {
    if (loadingMore) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMorePosts()
      }
    }, { 
      threshold: 0.1,
      rootMargin: "100px" // Load earlier before user reaches the bottom
    })

    if (node) observer.current.observe(node)
  }, [loadingMore, hasMore])

  const fetchPosts = async (pageNum) => {
    try {
      setLoading(pageNum === 0)
      if (pageNum > 0) setLoadingMore(true)

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false })
        .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1)

      if (error) throw error

      // Check if we've reached the end
      setHasMore(data.length === POSTS_PER_PAGE)

      if (pageNum === 0) {
        setPosts(data || [])
      } else {
        setPosts(prev => [...prev, ...data])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error loading posts",
        description: "Please refresh and try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage)
    }
  }

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="max-w-2xl mx-auto">
          {currentUser && (
            <div className="mb-6">
              <PostCreator currentUser={currentUser} onPostCreated={handleNewPost} />
            </div>
          )}

          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-card rounded-lg p-6 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-muted"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                {posts.map((post, index) => {
                  if (index === posts.length - 1) {
                    return (
                      <div ref={lastPostElementRef} key={post.id}>
                        <PostItem post={post} currentUser={currentUser} />
                      </div>
                    )
                  } else {
                    return <PostItem key={post.id} post={post} currentUser={currentUser} />
                  }
                })}

                {loadingMore && (
                  <div className="py-4 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading more posts...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-muted-foreground mt-2">Be the first to share something with the community!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}