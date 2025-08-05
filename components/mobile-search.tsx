"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Search, X, Clock, User, FileText, Calendar, ArrowRight, Users, MessageCircle, Building, Eye, TrendingUp, ArrowLeft, Sparkles } from "lucide-react";
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
        return <Badge variant="outline" className="text-xs">Post</Badge>;
      case "user":
        return <Badge variant="secondary" className="text-xs">Profile</Badge>;
      case "article":
        return <Badge variant="outline" className="text-xs">Article</Badge>;
      case "event":
        return <Badge variant="outline" className="text-xs">Event</Badge>;
      case "company":
        return <Badge variant="outline" className="text-xs">Company</Badge>;
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
      <div className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-all duration-200 cursor-pointer group border border-transparent hover:border-border">
        <div className="flex-shrink-0">
          {result.type === "user" && result.authorAvatar ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={result.authorAvatar} alt={result.author} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {result.author?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border">
              {getTypeIcon(result.type)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getTypeBadge(result.type)}
            <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {result.title}
            </h4>
          </div>
          
          {result.content && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {formatContent(result.content)}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {result.author && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{result.author}</span>
                </div>
              )}
              {result.timestamp && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}</span>
                </div>
              )}
              {result.metadata?.views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{result.metadata.views} views</span>
                </div>
              )}
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
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
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  }, [recentSearches]);

  // Get trending searches
  const getTrendingSearches = useCallback((): SearchSuggestion[] => {
    return [
      { text: "ESG professionals", type: "trending", icon: "👥" },
      { text: "Safety regulations", type: "trending", icon: "📋" },
      { text: "Environmental compliance", type: "suggestion", icon: "🏢" },
      { text: "Upcoming events", type: "suggestion", icon: "📅" },
      { text: "Risk management", type: "trending", icon: "⚠️" },
      { text: "Sustainability", type: "suggestion", icon: "🌱" },
    ];
  }, []);

  // Enhanced search with better categorization
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = `%${searchQuery}%`;
        const results: SearchResult[] = [];

        // Search users/profiles (top priority)
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, username, headline, company, location, avatar_url, created_at")
          .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm},headline.ilike.${searchTerm},company.ilike.${searchTerm}`)
          .order("created_at", { ascending: false })
          .limit(4);

        if (usersError) {
          console.error("Error searching users:", usersError);
        } else if (users) {
          users.forEach((user) => {
            results.push({
              id: user.id,
              type: "user",
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
            });
          });
        }

        // Search articles
        const { data: articles, error: articlesError } = await supabase
          .from("articles")
          .select(`
            id,
            title,
            excerpt,
            views,
            created_at,
            profiles!inner (
              full_name,
              avatar_url
            )
          `)
          .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
          .eq("published", true)
          .order("views", { ascending: false })
          .limit(4);

        if (articlesError) {
          console.error("Error searching articles:", articlesError);
        } else if (articles) {
          articles.forEach((article) => {
            // Handle profiles field properly - it might be an array or object
            const author = Array.isArray(article.profiles) ? article.profiles[0] : article.profiles;
            
            results.push({
              id: article.id,
              type: "article",
              title: article.title,
              content: article.excerpt,
              author: author?.full_name || "Unknown Author",
              authorAvatar: author?.avatar_url,
              timestamp: article.created_at,
              url: `/articles/${article.id}`,
              metadata: {
                views: article.views,
              },
            });
          });
        }

        // Search posts
        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select(`
            id,
            content,
            created_at,
            profiles!inner (
              full_name,
              avatar_url
            )
          `)
          .ilike("content", searchTerm)
          .order("created_at", { ascending: false })
          .limit(4);

        if (postsError) {
          console.error("Error searching posts:", postsError);
        } else if (posts) {
          posts.forEach((post) => {
            // Handle profiles field properly - it might be an array or object
            const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
            
            results.push({
              id: post.id,
              type: "post",
              title: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
              content: post.content,
              author: author?.full_name || "Anonymous",
              authorAvatar: author?.avatar_url,
              timestamp: post.created_at,
              url: `/posts/${post.id}`,
            });
          });
        }

        // Search events
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select(`
            id,
            title,
            description,
            created_at,
            profiles!inner (
              full_name,
              avatar_url
            )
          `)
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .order("created_at", { ascending: false })
          .limit(3);

        if (eventsError) {
          console.error("Error searching events:", eventsError);
        } else if (events) {
          events.forEach((event) => {
            // Handle profiles field properly - it might be an array or object
            const author = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles;
            
            results.push({
              id: event.id,
              type: "event",
              title: event.title,
              content: event.description,
              author: author?.full_name || "Unknown Author",
              authorAvatar: author?.avatar_url,
              timestamp: event.created_at,
              url: `/events/${event.id}`,
            });
          });
        }

        setResults(results);
      } catch (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to perform search. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(query);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, debouncedSearch]);

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
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder="Search people, articles, posts..."
          className="w-full pl-3 pr-10 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-all duration-200"
          style={{ fontSize: '14px' }}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSearchIconClick}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent"
        >
          <Search className="h-3 w-3" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="fixed inset-0 w-full h-full max-w-none p-0 m-0 rounded-none border-0 bg-transparent">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          <div className="relative w-full h-full flex flex-col bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2 h-10 w-10 rounded-full hover:bg-accent/50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 py-3 px-10 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 min-h-[44px] flex items-center">
                    {query ? `Searching for "${query}"...` : "Type to search people, articles, posts..."}
                  </div>
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                        <span className="text-sm text-muted-foreground">Searching...</span>
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedResults).map(([type, typeResults]) => (
                        <div key={type} className="space-y-3">
                          <div className="flex items-center gap-2 px-2 py-1">
                            {getTypeIcon(type)}
                            <h3 className="text-sm font-medium text-muted-foreground">
                              {getTypeLabel(type)} ({typeResults.length})
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {typeResults.map((result) => (
                              <SearchResultItem
                                key={`${result.type}-${result.id}`}
                                result={result}
                                onClose={handleCloseResults}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* View All Results Link */}
                      {query.trim() && (
                        <div className="pt-4 border-t border-border/50">
                          <Link 
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={handleCloseResults}
                            className="flex items-center justify-center gap-2 p-3 text-sm text-primary hover:bg-accent/50 rounded-lg transition-colors"
                          >
                            <span>View all results for "{query}"</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : query.length > 0 ? (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">No results found</p>
                          <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 px-2 py-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
                          </div>
                          <div className="space-y-1">
                            {recentSearches.map((searchTerm, index) => (
                              <button
                                key={searchTerm}
                                onClick={() => handleRecentSearchClick(searchTerm)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
                              >
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{searchTerm}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending Searches */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2 py-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium text-muted-foreground">Trending Searches</h3>
                        </div>
                        <div className="space-y-1">
                          {trendingSearches.map((suggestion, index) => (
                            <button
                              key={suggestion.text}
                              onClick={() => handleTrendingClick(suggestion)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
                            >
                              <span className="text-lg">{suggestion.icon}</span>
                              <span className="text-sm">{suggestion.text}</span>
                              {suggestion.type === "trending" && (
                                <div className="flex items-center gap-1 ml-auto">
                                  <Sparkles className="h-3 w-3 text-orange-500" />
                                  {suggestion.count && (
                                    <span className="text-xs text-muted-foreground">{suggestion.count}</span>
                                  )}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-4 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-3">
                          <Link 
                            href="/search"
                            onClick={handleCloseResults}
                            className="flex items-center justify-center gap-2 p-3 text-sm text-primary hover:bg-accent/50 rounded-lg transition-colors"
                          >
                            <Search className="h-3 w-3" />
                            <span>Advanced Search</span>
                          </Link>
                          <Link 
                            href="/articles"
                            onClick={handleCloseResults}
                            className="flex items-center justify-center gap-2 p-3 text-sm text-primary hover:bg-accent/50 rounded-lg transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Browse Articles</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 