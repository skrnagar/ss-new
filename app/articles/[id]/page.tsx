"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [claps, setClaps] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleResponse, commentsResponse, userResponse] = await Promise.all([
          supabase.from("articles_with_author").select("*").eq("id", id).single(),
          supabase.from("comments")
            .select(`*, profiles:profiles(*)`)
            .eq("article_id", id)
            .order("created_at", { ascending: false }),
          supabase.auth.getSession()
        ]);

        if (articleResponse.error) throw articleResponse.error;
        if (commentsResponse.error) throw commentsResponse.error;

        setArticle(articleResponse.data);
        setComments(commentsResponse.data || []);
        if (userResponse.data.session?.user) {
          setUser(userResponse.data.session.user);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="mb-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10">
              <Image
                src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                alt={article.profiles?.name}
                fill
                className="rounded-full object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{article.profiles?.name}</span>
              <Button variant="ghost" className="text-neutral-500 px-0 h-auto hover:text-neutral-900">
                Follow
              </Button>
            </div>
          </div>
          <div className="flex items-center text-neutral-500 text-sm gap-2">
            <span>{article.read_time || "5"} min read</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
          </div>
        </header>
        {article.cover_image && (
          <div className="relative w-full h-[400px] mb-8">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
}