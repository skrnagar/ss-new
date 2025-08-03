"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Users, FileText, MessageSquare, Building2, Calendar, BookOpen, ArrowRight, Clock, Hash, MapPin, Briefcase, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SearchResult {
  id: string;
  type: "post" | "user" | "article" | "event" | "group";
  title: string;
  content?: string;
  author?: string;
  authorAvatar?: string;
  timestamp?: string;
  url: string;
  tags?: string[];
  stats?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
  location?: string;
  company?: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [popularSearches] = useState([
    "Safety Management",
    "ESG Compliance",
    "Risk Assessment",
    "Sustainability",
    "Environmental",
    "Health & Safety"
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  }, [recentSearches]);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Search function with debouncing
  const searchContent = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const query = searchQuery.toLowerCase();

    try {
      const allResults: SearchResult[] = [];

      // Search posts with likes and comments count
      const { data: posts } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          profiles!user_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(8);

      if (posts) {
        posts.forEach(post => {
          const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
          allResults.push({
            id: post.id,
            type: "post",
            title: post.content?.substring(0, 80) + (post.content && post.content.length > 80 ? "..." : ""),
            content: post.content,
            author: profile?.full_name,
            authorAvatar: profile?.avatar_url,
            timestamp: post.created_at,
            url: `/posts/${post.id}`,
            tags: extractCleanHashtags(post.content || "")
          });
        });
      }

      // Search users
      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, headline, company, location")
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,headline.ilike.%${query}%,company.ilike.%${query}%`)
        .limit(6);

      if (users) {
        users.forEach(user => {
          allResults.push({
            id: user.id,
            type: "user",
            title: user.full_name || user.username,
            content: user.headline || user.company,
            author: user.full_name,
            authorAvatar: user.avatar_url,
            url: `/profile/${user.username || user.id}`,
            tags: user.company ? [user.company] : [],
            location: user.location,
            company: user.company
          });
        });
      }

      // Search articles
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, content, created_at, author_name, author_avatar")
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(6);

      if (articles) {
        articles.forEach(article => {
          allResults.push({
            id: article.id,
            type: "article",
            title: article.title,
            content: article.content?.substring(0, 120) + (article.content && article.content.length > 120 ? "..." : ""),
            author: article.author_name,
            authorAvatar: article.author_avatar,
            timestamp: article.created_at,
            url: `/articles/${article.id}`,
            tags: extractCleanTags(article.content || "")
          });
        });
      }

      // Search events
      const { data: events } = await supabase
        .from("events")
        .select("id, title, description, start_date, location")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
        .order("start_date", { ascending: true })
        .limit(4);

      if (events) {
        events.forEach(event => {
          allResults.push({
            id: event.id,
            type: "event",
            title: event.title,
            content: event.description,
            timestamp: event.start_date,
            url: `/events/${event.id}`,
            tags: event.location ? [event.location] : [],
            location: event.location
          });
        });
      }

      // Search groups
      const { data: groups } = await supabase
        .from("groups")
        .select("id, name, description, created_at")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(4);

      if (groups) {
        groups.forEach(group => {
          allResults.push({
            id: group.id,
            type: "group",
            title: group.name,
            content: group.description,
            timestamp: group.created_at,
            url: `/groups/${group.id}`,
            tags: []
          });
        });
      }

      setResults(allResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchContent(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchContent]);

  const extractCleanHashtags = (text: string): string[] => {
    const hashtags = text.match(/#[\w\u0590-\u05ff]+/g);
    return hashtags ? [...new Set(hashtags)].slice(0, 3) : [];
  };

  const extractCleanTags = (text: string): string[] => {
    // Extract potential tags from content, excluding common words
    const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'just', 'into', 'than', 'more', 'other', 'about', 'many', 'then', 'them', 'these', 'so', 'people', 'out', 'only', 'new', 'year', 'some', 'take', 'because', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'];
    const words = text.toLowerCase().match(/\b\w{4,}\b/g);
    if (!words) return [];
    
    const filteredWords = words.filter(word => !commonWords.includes(word));
    return [...new Set(filteredWords)].slice(0, 3);
  };

  const handleResultClick = (result: SearchResult) => {
    saveSearch(query);
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    setIsMobileExpanded(false);
    router.push(result.url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearch(query);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setIsMobileExpanded(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on results
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setIsMobileExpanded(false);
      }
    }, 200);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post": return <MessageSquare className="h-4 w-4" />;
      case "user": return <Users className="h-4 w-4" />;
      case "article": return <FileText className="h-4 w-4" />;
      case "event": return <Calendar className="h-4 w-4" />;
      case "group": return <Building2 className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "post": return "bg-blue-50 text-blue-700 border-blue-200";
      case "user": return "bg-green-50 text-green-700 border-green-200";
      case "article": return "bg-purple-50 text-purple-700 border-purple-200";
      case "event": return "bg-orange-50 text-orange-700 border-orange-200";
      case "group": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "post": return "Post";
      case "user": return "User";
      case "article": return "Article";
      case "event": return "Event";
      case "group": return "Group";
      default: return "Result";
    }
  };

  return (
    <div ref={searchRef} className={cn(
      "relative flex-1 max-w-2xl mx-2 sm:mx-4 transition-all duration-300",
      isMobileExpanded && "fixed inset-0 z-50 bg-white/95 backdrop-blur-sm p-4 flex flex-col"
    )}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search posts, users, articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={cn(
              "pl-10 pr-10 h-10 bg-white/90 backdrop-blur-sm border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-full text-sm",
              isMobileExpanded && "text-base"
            )}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {/* Mobile close button when expanded */}
      {isMobileExpanded && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsMobileExpanded(false);
            setIsOpen(false);
            setQuery("");
            inputRef.current?.blur();
          }}
          className="absolute top-4 right-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[700px] overflow-hidden z-50 min-w-[320px] sm:min-w-[400px]",
          isMobileExpanded && "fixed top-20 left-4 right-4 max-h-[calc(100vh-120px)]"
        )}>
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Search Results</h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                {isLoading ? "Searching..." : `${results.length} results`}
              </span>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={cn(
                      "p-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 group",
                      selectedIndex === index && "bg-gray-50"
                    )}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Badge className={cn("text-xs border", getTypeColor(result.type))}>
                          {getTypeIcon(result.type)}
                          <span className="ml-1">{getTypeLabel(result.type)}</span>
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                            {result.title}
                          </h4>
                        </div>
                        
                        {result.content && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                            {result.content}
                          </p>
                        )}

                        {/* Tags */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {result.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span key={tagIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                <Hash className="h-3 w-3" />
                                {tag.replace('#', '')}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta information */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {result.author && (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={result.authorAvatar} />
                                <AvatarFallback className="text-xs">
                                  {result.author.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[120px]">{result.author}</span>
                            </div>
                          )}
                          
                          {result.company && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{result.company}</span>
                            </div>
                          )}
                          
                          {result.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{result.location}</span>
                            </div>
                          )}
                          
                          {result.timestamp && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">No results found for "{query}"</p>
                <p className="text-xs text-gray-400">Try different keywords or browse categories</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </h4>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="flex items-center gap-2 w-full p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Search className="h-3 w-3" />
                          <span className="truncate">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-xs text-primary font-medium rounded-full transition-all duration-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 