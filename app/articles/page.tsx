
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
  const [articles, setArticles] = useState([]);
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
    { id: "featured", label: "Featured New" },
    { id: "machine-learning", label: "Machine Learning" },
    { id: "technology", label: "Technology" },
    { id: "data-science", label: "Data Science" },
  ];

  return (
    <div className="container py-8">
      {/* Header with tabs */}
      <div className="border-b mb-8 overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <SearchArticles />
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
                  className="flex gap-6 group hover:bg-gray-50 p-4 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                        alt={article.profiles?.name || "Author"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm font-medium">{article.profiles?.name}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 group-hover:text-primary">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {article.excerpt || article.content?.substring(0, 160)}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                      </span>
                      <span className="mx-2">·</span>
                      <span>{article.read_time || "5"} min read</span>
                      {article.tags && article.tags[0] && (
                        <>
                          <span className="mx-2">·</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {article.tags[0].name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {article.cover_image && (
                    <div className="relative h-32 w-32 flex-shrink-0">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
                        alt={article.title}
                        fill
                        className="object-cover rounded-lg"
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
          <div className="sticky top-4 space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="font-semibold mb-4">Staff Picks</h2>
              <div className="space-y-4">
                {articles.slice(0, 3).map((article: any) => (
                  <Link 
                    href={`/articles/${article.id}`} 
                    key={`staff-${article.id}`}
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                        alt={article.profiles?.name}
                        width={24}
                        height={24}
                        className="rounded-full mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium block mb-1">{article.profiles?.name}</span>
                        <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="font-semibold mb-4">Reading List</h2>
              <p className="text-sm text-gray-600 mb-4">
                Click the bookmark icon on any story to easily add it to your reading list or a custom list that you can share.
              </p>
              <Button className="w-full" variant="outline">
                View reading list
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
