"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchArticles } from "@/components/search-articles";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("for-you");

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from("articles_with_author")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });

        if (error) throw error;
        if (data) setArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const tabs = [
    { id: "for-you", label: "For you" },
    { id: "following", label: "Following" },
    { id: "featured", label: "Featured" },
    { id: "technology", label: "Technology" },
    { id: "data-science", label: "Data Science" },
  ];

  return (
    <div className="container py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 ${
                activeTab === tab.id
                  ? "text-black font-semibold border-b-2 border-black"
                  : "text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button asChild variant="outline">
          <Link href="/articles/create">
            <Plus className="h-4 w-4 mr-2" />
            Write
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-32 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {articles.map((article: any) => (
                <Link
                  href={`/articles/${article.id}`}
                  key={article.id}
                  className="flex gap-6 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/profile/${article.author_id}`}
                        className="flex items-center gap-2 hover:text-primary"
                      >
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
                      {article.excerpt ||
                        article.content?.replace(/<[^>]*>/g, "").substring(0, 160)}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                      </span>
                      <span className="mx-2">·</span>
                      <span>{article.read_time || "5"} min read</span>
                    </div>
                  </div>
                  {article.cover_image && (
                    <div className="relative h-32 w-32">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
                        alt={article.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h2 className="font-semibold mb-4">Staff Picks</h2>
            <div className="space-y-4 mb-8">
              {articles.slice(0, 3).map((article: any) => (
                <Link
                  href={`/articles/${article.id}`}
                  key={`staff-${article.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-2">
                    <Image
                      src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                      alt={article.profiles?.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <div>
                      <span className="text-sm font-medium">{article.profiles?.name}</span>
                      <h3 className="text-base font-semibold line-clamp-2">{article.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <h2 className="font-semibold mb-4">Recommended topics</h2>
            <div className="flex flex-wrap gap-2">
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
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
