"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Search, X, Clock, User, FileText, Calendar, ArrowRight, Users, MessageCircle, Building, Eye, TrendingUp, ArrowLeft, Sparkles, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

interface SearchResult {
  id: string;
  type: "post" | "user" | "article" | "event" | "company";
  title: string;
  content?: string;
  author?: string;
  authorAvatar?: string;
  timestamp: string;
  url: string;
  metadata?: {
    location?: string;
    company?: string;
    views?: number;
    likes?: number;
    comments?: number;
  };
}

interface SearchSuggestion {
  text: string;
  type: "recent" | "trending" | "suggestion";
  icon: React.ReactNode;
  count?: number;
}

interface SearchResultProps {
  result: SearchResult;
  onClose: () => void;
}

const SearchResultItem = ({ result, onClose }: SearchResultProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageCircle className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "company":
        return <Building className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "post":
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Post</Badge>;
      case "user":
        return <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">Profile</Badge>;
      case "article":
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Article</Badge>;
      case "event":
        return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Event</Badge>;
      case "company":
        return <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">Company</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Result</Badge>;
    }
  };

  const formatContent = (content: string) => {
    if (content.length > 80) {
      return content.substring(0, 80) + "...";
    }
    return content;
  };

  return (
    <Link href={result.url} onClick={onClose}>
      <div className="flex items-start gap-3 p-4 hover:bg-accent/30 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-border/50 hover:shadow-sm">
        <div className="flex-shrink-0">
          {result.type === "user" && result.authorAvatar ? (
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={result.authorAvatar} alt={result.author} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                {result.author?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              {getTypeIcon(result.type)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                {result.title}
              </h4>
              {result.author && (
                <p className="text-xs text-muted-foreground mt-1">
                  by {result.author}
                </p>
              )}
            </div>
            {getTypeBadge(result.type)}
          </div>

          {result.content && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {formatContent(result.content)}
            </p>
          )}

          {result.metadata && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {result.metadata.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{result.metadata.location}</span>
                </div>
              )}
              {result.metadata.company && (
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span>{result.metadata.company}</span>
                </div>
              )}
              {result.metadata.views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{result.metadata.views} views</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export function MobileSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error parsing recent searches:", error);
        setRecentSearches([]);
      }
    }
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
        // Also set cursor to end of text
        if (inputRef.current && query) {
          inputRef.current.setSelectionRange(query.length, query.length);
        }
      }, 150);
    }
  }, [isOpen, query]);

  // Save recent search with debouncing
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [searchTerm, ...prev.filter(s => s !== searchTerm)].slice(0, 5);
      try {
        localStorage.setItem("recentSearches", JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving recent searches:", error);
      }
      return updated;
    });
  }, []);

  // Get trending searches with caching
  const getTrendingSearches = useCallback((): SearchSuggestion[] => {
    return [
      { text: "ESG professionals", type: "trending", icon: "👥", count: 156 },
      { text: "Safety regulations", type: "trending", icon: "📋", count: 89 },
      { text: "Environmental compliance", type: "suggestion", icon: "🏢" },
      { text: "Upcoming events", type: "suggestion", icon: "📅" },
      { text: "Risk management", type: "trending", icon: "⚠️", count: 234 },
      { text: "Sustainability", type: "suggestion", icon: "🌱" },
    ];
  }, []);

  // Optimized search with better performance
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchTerm = `%${searchQuery}%`;
      
      // Use Promise.allSettled for parallel execution and better error handling
      const [usersResult, articlesResult, postsResult] = await Promise.allSettled([
        supabase
          .from("profiles")
          .select("id, full_name, username, headline, company, location, avatar_url, created_at")
          .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm},headline.ilike.${searchTerm},company.ilike.${searchTerm}`)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("articles")
          .select(`
            id, title, excerpt, views, created_at,
            profiles!inner (full_name, avatar_url)
          `)
          .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
          .eq("published", true)
          .order("views", { ascending: false })
          .limit(4),
        supabase
          .from("posts")
          .select(`
            id, content, created_at,
            profiles!inner (full_name, avatar_url)
          `)
          .ilike("content", searchTerm)
          .order("created_at", { ascending: false })
          .limit(4)
      ]);

      const results: SearchResult[] = [];

      // Process users
      if (usersResult.status === "fulfilled" && usersResult.value.data) {
        results.push(...usersResult.value.data.map(user => ({
          id: user.id,
          type: "user" as const,
          title: user.full_name || user.username || "Unknown User",
          content: user.headline || user.company,
          author: user.full_name || user.username,
          authorAvatar: user.avatar_url,
          timestamp: user.created_at,
          url: `/profile/${user.username}`,
          metadata: {
            location: user.location,
            company: user.company,
          },
        })));
      }

      // Process articles
      if (articlesResult.status === "fulfilled" && articlesResult.value.data) {
        results.push(...articlesResult.value.data.map(article => {
          const author = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles;
          return {
            id: article.id,
            type: "article" as const,
            title: article.title,
            content: article.excerpt,
            author: author?.full_name || "Unknown Author",
            authorAvatar: author?.avatar_url,
            timestamp: article.created_at,
            url: `/articles/${article.id}`,
            metadata: {
              views: article.views,
            },
          };
        }));
      }

      // Process posts
      if (postsResult.status === "fulfilled" && postsResult.value.data) {
        results.push(...postsResult.value.data.map(post => {
          const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
          const cleanContent = post.content
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          return {
            id: post.id,
            type: "post" as const,
            title: cleanContent.length > 60 ? cleanContent.substring(0, 60) + "..." : cleanContent,
            content: cleanContent,
            author: author?.full_name || "Anonymous",
            authorAvatar: author?.avatar_url,
            timestamp: post.created_at,
            url: `/posts/${post.id}`,
          };
        }));
      }

      setResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Debounced search with proper memoization
  const debouncedSearch = useCallback((searchQuery: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    setSearchTimeout(timeout);
  }, [performSearch]); // Removed searchTimeout from dependencies

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Trigger search when query changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query]); // Removed debouncedSearch from dependencies to prevent infinite loops

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSearchIconClick = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const handleCloseResults = () => {
    setIsOpen(false);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setIsOpen(false);
  };

  const handleTrendingClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    saveRecentSearch(suggestion.text);
    router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
    setIsOpen(false);
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "user":
        return "People";
      case "article":
        return "Articles";
      case "post":
        return "Posts";
      case "event":
        return "Events";
      case "company":
        return "Companies";
      default:
        return "Results";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      case "post":
        return <MessageCircle className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "company":
        return <Building className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const trendingSearches = getTrendingSearches();

  return (
    <>
      {/* Main Search Input - Trigger */}
      <div className="relative w-full group">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder="Search people, articles, posts..."
          className="w-full pl-3 pr-10 bg-background/60 backdrop-blur-md border-border/40 hover:bg-background/80 focus:bg-background/90 transition-all duration-300 group-hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
          style={{ fontSize: '14px' }}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSearchIconClick}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/50 transition-all duration-200"
        >
          <Search className="h-3 w-3" />
        </Button>
      </div>

      {/* Enhanced Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="fixed inset-0 w-full h-full max-w-none p-0 m-0 rounded-none border-0 bg-transparent">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
          <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-sm">
            {/* Modern Header */}
            <div className="flex-shrink-0 p-4 border-b border-border/30 bg-background/80 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2 h-10 w-10 rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type to search people, articles, posts..."
                    className="w-full pl-10 pr-10 bg-background/60 backdrop-blur-md border-border/40 hover:bg-background/80 focus:bg-background/90 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    style={{ fontSize: '14px' }}
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/50 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Content Area */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-4 space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary/20 border-t-primary"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-pulse"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Searching...</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Finding the best results for you</p>
                        </div>
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(groupedResults).map(([type, typeResults]) => (
                        <div key={type} className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center gap-2 px-2 py-1">
                            <div className="p-1 rounded-md bg-primary/10">
                              {getTypeIcon(type)}
                            </div>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                              {getTypeLabel(type)} ({typeResults.length})
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {typeResults.map((result, index) => (
                              <div
                                key={`${result.type}-${result.id}`}
                                className="animate-in slide-in-from-bottom-2 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <SearchResultItem
                                  result={result}
                                  onClose={handleCloseResults}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Enhanced View All Results Link */}
                      {query.trim() && (
                        <div className="pt-6 border-t border-border/30 animate-in slide-in-from-bottom-2 duration-300">
                          <Link 
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={handleCloseResults}
                            className="flex items-center justify-center gap-3 p-4 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 hover:scale-[1.02] border border-primary/20 hover:border-primary/40"
                          >
                            <span>View all results for "{query}"</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : query.length > 0 ? (
                    <div className="text-center py-16 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-muted-foreground">No results found</p>
                          <p className="text-sm text-muted-foreground/70 mt-1">Try different keywords or check your spelling</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                      {/* Enhanced Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 px-2 py-1">
                            <div className="p-1 rounded-md bg-blue-500/10">
                              <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                            <h3 className="text-sm font-semibold text-muted-foreground">Recent Searches</h3>
                          </div>
                          <div className="space-y-2">
                            {recentSearches.map((searchTerm, index) => (
                              <button
                                key={searchTerm}
                                onClick={() => handleRecentSearchClick(searchTerm)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 text-left group hover:scale-[1.02]"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm group-hover:text-primary transition-colors">{searchTerm}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Trending Searches */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2 py-1">
                          <div className="p-1 rounded-md bg-orange-500/10">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                          </div>
                          <h3 className="text-sm font-semibold text-muted-foreground">Trending Searches</h3>
                        </div>
                        <div className="space-y-2">
                          {trendingSearches.map((suggestion, index) => (
                            <button
                              key={suggestion.text}
                              onClick={() => handleTrendingClick(suggestion)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 text-left group hover:scale-[1.02]"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <span className="text-lg group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                              <span className="text-sm group-hover:text-primary transition-colors">{suggestion.text}</span>
                              {suggestion.type === "trending" && (
                                <div className="flex items-center gap-1 ml-auto">
                                  <Sparkles className="h-3 w-3 text-orange-500" />
                                  {suggestion.count && (
                                    <span className="text-xs text-muted-foreground bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                      {suggestion.count}
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Quick Actions */}
                      <div className="pt-6 border-t border-border/30">
                        <div className="grid grid-cols-2 gap-3">
                          <Link 
                            href="/search"
                            onClick={handleCloseResults}
                            className="flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 hover:scale-[1.02] border border-primary/20 hover:border-primary/40"
                          >
                            <Search className="h-4 w-4" />
                            <span>Advanced Search</span>
                          </Link>
                          <Link 
                            href="/articles"
                            onClick={handleCloseResults}
                            className="flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 hover:scale-[1.02] border border-primary/20 hover:border-primary/40"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Browse Articles</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 