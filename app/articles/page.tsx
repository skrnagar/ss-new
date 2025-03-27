
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const supabaseClient = supabase;

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from("articles")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (data) setArticles(data);
    }

    fetchArticles();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button asChild>
          <Link href="/articles/create">
            <Plus className="h-4 w-4 mr-2" />
            Write Article
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.map((article) => (
          <Link 
            href={`/articles/${article.id}`} 
            key={article.id}
            className="group"
          >
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={article.cover_image || "/placeholder.jpg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {article.title}
                </h2>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {article.excerpt || article.content?.substring(0, 160)}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Image
                      src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                      alt={article.profiles?.full_name || "Author"}
                      width={24}
                      height={24}
                      className="rounded-full mr-2"
                    />
                    <span>{article.profiles?.full_name}</span>
                  </div>
                  <span>
                    {article.published_at && 
                      formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
