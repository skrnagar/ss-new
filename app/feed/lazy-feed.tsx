
"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { PostItem } from '@/components/post-item'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function LazyFeed({ initialPosts = [], currentUser = null }) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const observerRef = useRef(null)
  const { toast } = useToast()
  const POSTS_PER_PAGE = 5

  // Fetch more posts
  const fetchMorePosts = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    
    try {
      // Calculate the proper offset
      const offset = page * POSTS_PER_PAGE

      // Fetch posts with profile information
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(id, username, full_name, headline, position, company, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1)

      if (error) throw error

      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false)
      }

      if (data.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...data])
        setPage(prevPage => prevPage + 1)
      }
    } catch (error) {
      console.error('Error fetching more posts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load more posts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore, toast])

  // Setup Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMorePosts()
        }
      },
      { threshold: 0.5 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [observerRef, fetchMorePosts, hasMore])

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostItem key={post.id} post={post} currentUser={currentUser} />
      ))}
      
      {/* Loading indicator and observer */}
      <div ref={observerRef} className="py-4 text-center">
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading more posts...</span>
          </div>
        )}
        
        {!hasMore && posts.length > 0 && (
          <p className="text-muted-foreground">No more posts to load</p>
        )}
        
        {!hasMore && posts.length === 0 && (
          <p className="text-muted-foreground">No posts found</p>
        )}
      </div>
    </div>
  )
}
