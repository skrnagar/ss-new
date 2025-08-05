"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  FileText,
  MessageCircle,
  Building,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Settings,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { GlobalSearch } from "@/components/global-search";

interface SearchResult {
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
    comments?: number;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, sortBy, filterType]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchTerm = `%${searchQuery}%`;
      let allResults: SearchResult[] = [];

      // Search profiles
      if (filterType === "all" || filterType === "profiles") {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, headline, company, location, avatar_url, created_at")
          .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm},headline.ilike.${searchTerm},company.ilike.${searchTerm}`)
          .limit(20);

        if (profiles) {
          allResults.push(...profiles.map(profile => ({
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
          })));
        }
      }

      // Search articles
      if (filterType === "all" || filterType === "articles") {
        const { data: articles } = await supabase
          .from("articles")
          .select(`
            id, title, excerpt, views, created_at, read_time,
            author:profiles!articles_author_id_fkey(full_name, avatar_url)
          `)
          .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
          .eq("published", true)
          .limit(20);

        if (articles) {
          allResults.push(...articles.map(article => {
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
            };
          }));
        }
      }

      // Search posts
      if (filterType === "all" || filterType === "posts") {
        const { data: posts } = await supabase
          .from("posts")
          .select(`
            id, content, created_at,
            author:profiles!posts_user_id_fkey(full_name, avatar_url)
          `)
          .ilike("content", searchTerm)
          .limit(20);

        if (posts) {
          allResults.push(...posts.map(post => {
            // Handle author field properly - it might be an array or object
            const author = Array.isArray(post.author) ? post.author[0] : post.author;
            
            // Clean and format post content
            const cleanContent = post.content
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
            
            // Create a better title from content
            const title = cleanContent.length > 60 
              ? cleanContent.substring(0, 60) + "..." 
              : cleanContent;
            
            // Create description from remaining content
            const description = cleanContent.length > 60 
              ? cleanContent.substring(60, 160) + (cleanContent.length > 160 ? "..." : "")
              : "";

            return {
              id: post.id,
              type: "post" as const,
              title: title,
              subtitle: author?.full_name || "Anonymous",
              description: description,
              avatar: author?.avatar_url,
              url: `/posts/${post.id}`,
              metadata: {
                date: new Date(post.created_at).toLocaleDateString(),
              },
            };
          }));
        }
      }

      // Sort results
      const sortedResults = sortResults(allResults, sortBy);
      setResults(sortedResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortResults = (results: SearchResult[], sortBy: string) => {
    switch (sortBy) {
      case "date":
        return results.sort((a, b) => {
          const dateA = a.metadata?.date ? new Date(a.metadata.date).getTime() : 0;
          const dateB = b.metadata?.date ? new Date(b.metadata.date).getTime() : 0;
          return dateB - dateA;
        });
      case "views":
        return results.sort((a, b) => (b.metadata?.views || 0) - (a.metadata?.views || 0));
      default:
        return results;
    }
  };

  const getFilteredResults = () => {
    if (activeTab === "all") return results;
    return results.filter(result => result.type === activeTab);
  };

  const filteredResults = getFilteredResults();

  const profiles = results.filter(r => r.type === 'profile');
  const articles = results.filter(r => r.type === 'article');
  const posts = results.filter(r => r.type === 'post');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Search Results
                {query && (
                  <span className="text-foreground font-normal">
                    {" "}for "{query}"
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isLoading ? "Searching..." : `${filteredResults.length} results found`}
              </p>
            </div>
            <div className="w-80">
              {/* <GlobalSearch /> */}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search Filters */}
              <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content Type</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="profiles">People</SelectItem>
                        <SelectItem value="articles">Articles</SelectItem>
                        <SelectItem value="posts">Posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="views">Views</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    Results Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-sm font-medium">People</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">{profiles.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-sm font-medium">Articles</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">{articles.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-sm font-medium">Posts</span>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">{posts.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filters - Shown only on mobile */}
            <div className="lg:hidden mb-4">
              <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content Type</label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="profiles">People</SelectItem>
                          <SelectItem value="articles">Articles</SelectItem>
                          <SelectItem value="posts">Posts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="views">Views</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Mobile Stats */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Results:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">{profiles.length} People</Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">{articles.length} Articles</Badge>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 text-xs">{posts.length} Posts</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-background/80 backdrop-blur-sm border-0 shadow-lg h-auto p-1">
                <TabsTrigger value="all" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                  <Search className="h-3 w-3" />
                  <span className="hidden sm:inline">All</span>
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{results.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                  <Users className="h-3 w-3" />
                  <span className="hidden sm:inline">People</span>
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{profiles.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="article" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                  <FileText className="h-3 w-3" />
                  <span className="hidden sm:inline">Articles</span>
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{articles.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="post" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                  <MessageCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Posts</span>
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{posts.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Searching...
                    </div>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-3">
                    {filteredResults.map((result) => (
                      <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>

              <TabsContent value="profile" className="mt-4">
                {profiles.length > 0 ? (
                  <div className="space-y-3">
                    {profiles.map((result) => (
                      <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>

              <TabsContent value="article" className="mt-4">
                {articles.length > 0 ? (
                  <div className="space-y-3">
                    {articles.map((result) => (
                      <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>

              <TabsContent value="post" className="mt-4">
                {posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.map((result) => (
                      <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "profile":
        return <Users className="h-5 w-5" />;
      case "article":
        return <FileText className="h-5 w-5" />;
      case "post":
        return <MessageCircle className="h-5 w-5" />;
      case "event":
        return <Calendar className="h-5 w-5" />;
      case "company":
        return <Building className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getResultBadge = (type: SearchResult["type"]) => {
    switch (type) {
      case "profile":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Profile</Badge>;
      case "article":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">Article</Badge>;
      case "post":
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 text-xs">Post</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-background/80 backdrop-blur-sm group">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            {result.avatar ? (
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                <AvatarImage src={result.avatar} alt={result.title} />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold text-sm">
                  {result.title.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                {getResultIcon(result.type)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <Link 
                    href={result.url}
                    className="text-base sm:text-lg font-semibold hover:text-primary transition-colors truncate group-hover:underline"
                  >
                    {result.title}
                  </Link>
                  {getResultBadge(result.type)}
                </div>

                {result.subtitle && (
                  <p className="text-sm text-muted-foreground mb-2 font-medium">
                    {result.subtitle}
                  </p>
                )}

                {result.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {result.description}
                  </p>
                )}

                {result.metadata && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    {result.metadata.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="hidden sm:inline">{result.metadata.location}</span>
                      </div>
                    )}
                    {result.metadata.company && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="hidden sm:inline">{result.metadata.company}</span>
                      </div>
                    )}
                    {result.metadata.date && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.metadata.date}
                      </div>
                    )}
                    {result.metadata.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {result.metadata.views} views
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all w-full sm:w-auto">
                <Link href={result.url} className="flex items-center justify-center gap-1">
                  View
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      </div>
    </div>
  );
} 