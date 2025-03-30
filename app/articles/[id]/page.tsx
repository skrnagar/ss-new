
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const { data, error } = await supabase
          .from("articles_with_author")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/profile/${article.profiles?.username}`} className="flex items-center gap-3 group">
            <Image
              src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
              alt={article.profiles?.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <div className="font-medium group-hover:text-primary">
                {article.profiles?.name}
              </div>
              <div className="text-sm text-gray-500">
                {article.profiles?.headline}
              </div>
            </div>
          </Link>
        </div>

        {article.cover_image && (
          <div className="relative aspect-[2/1] mb-8">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex items-center text-sm text-gray-500 gap-3">
          <span>
            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
          </span>
          <span>·</span>
          <span>{article.read_time || "5"} min read</span>
        </div>
      </header>

      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
