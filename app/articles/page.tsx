"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, TrendingUp, Clock, Eye, Heart, Share2, Bookmark, Star, Shield, Leaf } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchArticles } from "@/components/search-articles";
import useSWR from 'swr';
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const fetchArticles = async () => {
  const { data, error } = await supabase
    .from("articles_with_author")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data;
};

const ArticleCard = ({ article, index }: { article: any; index: number }) => (
  <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-white/50 backdrop-blur-sm">
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="flex-1 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-primary/10">
            <AvatarImage src={article.author_avatar || "/placeholder-user.jpg"} alt={article.author_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs sm:text-sm">
              {article.author_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{article.author_name}</p>
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="truncate">{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">{article.read_time || "5"} min read</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100">
              <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100">
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {article.title}
          </h2>
          <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm lg:text-sm">
            {article.excerpt || article.content?.replace(/<[^>]*>/g, "").substring(0, 200)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>1.2k</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>48</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
            {article.category || "General"}
          </Badge>
        </div>
      </div>
      
      {article.cover_image && (
        <div className="relative h-32 sm:h-48 lg:h-40 w-full lg:w-48 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
    </div>
  </Card>
);

export default function ArticlesPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: articles = [], error, isLoading } = useSWR(
    !authLoading ? 'articles' : null,
    fetchArticles
  );
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "for-you", label: "For you", icon: TrendingUp },
    { id: "following", label: "Following", icon: Heart },
    { id: "featured", label: "Featured", icon: Star },
    { id: "safety", label: "Safety", icon: Shield },
    { id: "esh", label: "ESH", icon: Leaf },
  ];

  const filteredArticles = articles.filter((article: any) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Discover Articles
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-sm">
                Discover expert insights, best practices, and industry trends in ESG and EHS management
              </p>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/articles/create">
                <Plus className="h-5 w-5 mr-2" />
                Write Article
              </Link>
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-6 sm:mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white/70 backdrop-blur-sm border-gray-200 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <Button variant="outline" className="h-12 px-6 border-gray-200 bg-white/70 backdrop-blur-sm hover:bg-white w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex items-center overflow-x-auto scrollbar-hide bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-8">
            {isLoading || authLoading ? (
              <div className="space-y-4 sm:space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse bg-white/50 backdrop-blur-sm border-0">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-1" />
                          <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-5 sm:h-6 w-3/4 mb-2 sm:mb-3" />
                      <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
                      <Skeleton className="h-3 sm:h-4 w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {filteredArticles.map((article: any, index: number) => (
                  <Link href={`/articles/${article.id}`} key={article.id}>
                    <ArticleCard article={article} index={index} />
                  </Link>
                ))}
                {filteredArticles.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                    <p className="text-sm sm:text-sm text-gray-600">Try adjusting your search or browse our featured content.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="col-span-1 lg:col-span-4 space-y-6 sm:space-y-8">
            {/* Trending Articles */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {articles.slice(0, 3).map((article: any) => (
                  <Link
                    href={`/articles/${article.id}`}
                    key={`trending-${article.id}`}
                    className="group block"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={article.author_avatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-xs">{article.author_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{article.author_name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Safety Management",
                    "ESG Compliance",
                    "Risk Assessment",
                    "Sustainability",
                    "Environmental",
                    "Health & Safety",
                    "Regulations",
                    "Best Practices"
                  ].map((topic) => (
                    <Link
                      key={topic}
                      href={`/tags/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm font-medium rounded-full hover:from-primary/20 hover:to-primary/10 transition-all duration-200"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest articles and insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter your email"
                    className="bg-white/80 backdrop-blur-sm border-gray-200"
                  />
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
