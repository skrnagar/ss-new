"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchArticles } from "@/components/search-articles";
import useSWR from 'swr';
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fetchArticles = async () => {
  const { data, error } = await supabase
    .from("articles_with_author")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data;
};

const ArticleCard = ({ article }: { article: any }) => (
  <Card className="group transition-shadow hover:shadow-lg cursor-pointer">
    <div className="flex gap-6">
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/profile/${article.author_id}`} className="flex items-center gap-2 hover:text-primary">
            <Image
              src={article.author_avatar || "/placeholder-user.jpg"}
              alt={article.author_name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-medium">{article.author_name}</span>
          </Link>
        </div>
        <h2 className="text-xl font-bold mb-1 group-hover:text-primary">
          {article.title}
        </h2>
        <p className="text-gray-600 line-clamp-2 mb-2">
          {article.excerpt || article.content?.replace(/<[^>]*>/g, "").substring(0, 160)}
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
          <span className="mx-2">·</span>
          <span>{article.read_time || "5"} min read</span>
        </div>
      </div>
      {article.cover_image && (
        <div className="relative h-32 w-32 flex-shrink-0 m-4">
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
            alt={article.title}
            fill
            className="object-cover rounded-md"
          />
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

  const tabs = [
    { id: "for-you", label: "For you" },
    { id: "following", label: "Following" },
    { id: "featured", label: "Featured" },
    { id: "safety", label: "Safety" },
    { id: "esh", label: "ESH" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Top Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div className="flex items-center space-x-8 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap py-2 px-2 transition-colors duration-200 rounded-none border-b-2 text-base sm:text-lg font-medium bg-transparent focus:outline-none ${
                  activeTab === tab.id
                    ? "text-primary font-bold border-primary"
                    : "text-gray-600 border-transparent hover:text-primary"
                }`}
                style={{ minWidth: 0 }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transition-all duration-300" />
                )}
              </button>
            ))}
          </div>
          <Button asChild variant="default" className="flex-shrink-0 px-6 py-2 text-base font-semibold shadow-md hover:shadow-lg mt-4 md:mt-0">
            <Link href="/articles/create">
              <Plus className="h-5 w-5 mr-2" />
              Write
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-8 order-1 lg:order-1">
            {isLoading || authLoading ? (
              <div className="space-y-10">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse mb-10 bg-white rounded-2xl shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1 p-4 sm:p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-32 w-32 m-4 sm:m-6" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {articles.map((article: any) => (
                  <Link href={`/articles/${article.id}`} key={article.id}>
                    <Card className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 mb-10 cursor-pointer">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 p-4 sm:p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Image
                              src={article.author_avatar || "/placeholder-user.jpg"}
                              alt={article.author_name}
                              width={32}
                              height={32}
                              className="rounded-full border"
                            />
                            <span className="text-sm font-semibold text-gray-800">{article.author_name}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h2>
                          <p className="text-gray-600 text-base line-clamp-2 mb-3">
                            {article.excerpt || article.content?.replace(/<[^>]*>/g, "").substring(0, 160)}
                          </p>
                          <div className="flex items-center text-sm text-gray-400">
                            <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                            <span className="mx-2">·</span>
                            <span>{article.read_time || "5"} min read</span>
                          </div>
                        </div>
                        {article.cover_image ? (
                          <div className="relative h-32 w-32 flex-shrink-0 m-4 sm:m-6 rounded-xl overflow-hidden bg-gray-100">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-32 w-32 flex-shrink-0 m-4 sm:m-6 rounded-xl bg-gray-100 flex items-center justify-center">
                            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                              <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                              <path d="M8 16l2.5-3 2.5 3 3.5-5 4 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-1 lg:col-span-4 space-y-10 order-2 lg:order-2 mt-10 lg:mt-0">
            <div>
              <h3 className="text-xl font-bold mb-4">Staff Picks</h3>
              <div className="space-y-6">
                {articles.slice(0, 3).map((article: any) => (
                  <Link
                    href={`/articles/${article.id}`}
                    key={`staff-${article.id}`}
                    className="flex items-center gap-3 group hover:underline"
                  >
                    <Image
                      src={article.author_avatar || "/placeholder-user.jpg"}
                      alt={article.author_name}
                      width={28}
                      height={28}
                      className="rounded-full border"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{article.author_name}</span>
                      <h4 className="text-base font-semibold group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-bold mb-4">Recommended topics</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  "Programming",
                  "Artificial Intelligence",
                  "Python",
                  "Cybersecurity",
                  "Science",
                  "Productivity",
                ].map((topic) => (
                  <Link
                    key={topic}
                    href={`/tags/${topic.toLowerCase()}`}
                    className="px-4 py-2 bg-gray-100 rounded-full text-base font-medium hover:bg-gray-200 transition-colors"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
