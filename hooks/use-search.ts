import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface SearchResult {
  id: string;
  type: "profile" | "article" | "post" | "event" | "company";
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  url: string;
  metadata?: {
    location?: string;
    company?: string;
    date?: string;
    views?: number;
    likes?: number;
  };
  highlightedTitle?: string;
  highlightedDescription?: string;
}

export interface SearchSuggestion {
  text: string;
  type: "recent" | "trending" | "suggestion";
  icon: React.ReactNode;
  count?: number;
}

// Search cache to avoid repeated API calls
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Search analytics
const searchAnalytics = {
  trackSearch: (query: string, resultCount: number) => {
    try {
      const analytics = JSON.parse(localStorage.getItem("searchAnalytics") || "{}");
      analytics[query] = (analytics[query] || 0) + 1;
      analytics[`${query}_results`] = resultCount;
      localStorage.setItem("searchAnalytics", JSON.stringify(analytics));
    } catch (error) {
      console.warn("Failed to track search analytics:", error);
    }
  },
  
  getPopularSearches: (): string[] => {
    try {
      const analytics = JSON.parse(localStorage.getItem("searchAnalytics") || "{}");
      return Object.entries(analytics)
        .filter(([key]) => !key.endsWith("_results"))
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([query]) => query);
    } catch (error) {
      return [];
    }
  }
};

// Highlight matching text
const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
};

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches and popular searches
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    setPopularSearches(searchAnalytics.getPopularSearches());
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  }, [recentSearches]);

  // Enhanced search function with caching and highlighting
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    // Check cache first
    const cacheKey = searchQuery.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResults(cached.results);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const searchTerm = `%${searchQuery}%`;
      const allResults: SearchResult[] = [];

      // Parallel search across all content types
      const [profilesResult, articlesResult, postsResult] = await Promise.allSettled([
        supabase
          .from("profiles")
          .select("id, full_name, username, headline, company, location, avatar_url, created_at")
          .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm},headline.ilike.${searchTerm},company.ilike.${searchTerm}`)
          .limit(8)
          .abortSignal(abortControllerRef.current.signal),
        
        supabase
          .from("articles")
          .select(`
            id, title, excerpt, views, created_at, read_time,
            author:profiles!articles_author_id_fkey(full_name, avatar_url)
          `)
          .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
          .eq("published", true)
          .limit(8)
          .abortSignal(abortControllerRef.current.signal),
        
        supabase
          .from("posts")
          .select(`
            id, content, created_at,
            author:profiles!posts_user_id_fkey(full_name, avatar_url)
          `)
          .ilike("content", searchTerm)
          .limit(6)
          .abortSignal(abortControllerRef.current.signal)
      ]);

      // Process profiles
      if (profilesResult.status === "fulfilled" && profilesResult.value.data) {
        allResults.push(...profilesResult.value.data.map(profile => ({
          id: profile.id,
          type: "profile" as const,
          title: profile.full_name || profile.username || "Unknown User",
          subtitle: profile.headline,
          description: profile.company,
          avatar: profile.avatar_url,
          url: `/profile/${profile.username}`,
          metadata: {
            location: profile.location,
            company: profile.company,
            date: new Date(profile.created_at).toLocaleDateString(),
          },
          highlightedTitle: highlightText(profile.full_name || profile.username || "Unknown User", searchQuery),
          highlightedDescription: profile.company ? highlightText(profile.company, searchQuery) : undefined,
        })));
      }

      // Process articles
      if (articlesResult.status === "fulfilled" && articlesResult.value.data) {
        allResults.push(...articlesResult.value.data.map(article => {
          // Handle author field properly - it might be an array or object
          const author = Array.isArray(article.author) ? article.author[0] : article.author;
          
          return {
            id: article.id,
            type: "article" as const,
            title: article.title,
            subtitle: author?.full_name || "Unknown Author",
            description: article.excerpt,
            avatar: author?.avatar_url,
            url: `/articles/${article.id}`,
            metadata: {
              date: new Date(article.created_at).toLocaleDateString(),
              views: article.views,
            },
            highlightedTitle: highlightText(article.title, searchQuery),
            highlightedDescription: article.excerpt ? highlightText(article.excerpt, searchQuery) : undefined,
          };
        }));
      }

      // Process posts
      if (postsResult.status === "fulfilled" && postsResult.value.data) {
        allResults.push(...postsResult.value.data.map(post => {
          // Handle author field properly - it might be an array or object
          const author = Array.isArray(post.author) ? post.author[0] : post.author;
          
          return {
            id: post.id,
            type: "post" as const,
            title: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
            subtitle: author?.full_name || "Anonymous",
            avatar: author?.avatar_url,
            url: `/posts/${post.id}`,
            metadata: {
              date: new Date(post.created_at).toLocaleDateString(),
            },
            highlightedTitle: highlightText(post.content.substring(0, 100), searchQuery),
          };
        }));
      }

      // Sort results by relevance and ensure balanced representation
      const sortedResults = allResults.sort((a, b) => {
        // First prioritize by type relevance
        const typeOrder = { profile: 0, article: 1, post: 2, event: 3, company: 4 };
        const typeDiff = (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
        
        if (typeDiff !== 0) return typeDiff;
        
        // Then by date (newer first)
        const dateA = a.metadata?.date ? new Date(a.metadata.date).getTime() : 0;
        const dateB = b.metadata?.date ? new Date(b.metadata.date).getTime() : 0;
        return dateB - dateA;
      });

      // Cache results
      searchCache.set(cacheKey, { results: sortedResults, timestamp: Date.now() });

      // Track analytics
      searchAnalytics.trackSearch(searchQuery, sortedResults.length);

      setResults(sortedResults);
      setError(null);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      console.error("Search error:", error);
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    searchCache.clear();
  }, []);

  // Get trending searches based on analytics
  const getTrendingSearches = useCallback((): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [
      { text: "ESG professionals", type: "trending", icon: "👥" },
      { text: "Safety regulations", type: "trending", icon: "📋" },
      { text: "Environmental compliance", type: "suggestion", icon: "🏢" },
      { text: "Upcoming events", type: "suggestion", icon: "📅" },
    ];

    // Add popular searches from analytics
    const popular = popularSearches.slice(0, 3);
    popular.forEach(query => {
      suggestions.unshift({
        text: query,
        type: "trending",
        icon: "🔥",
        count: 1
      });
    });

    return suggestions;
  }, [popularSearches]);

  return {
    results,
    isLoading,
    error,
    recentSearches,
    performSearch,
    saveRecentSearch,
    clearCache,
    getTrendingSearches,
  };
} 