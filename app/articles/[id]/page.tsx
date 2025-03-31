"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
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

  const handleClap = async () => {
    if (!user) return;
    setClaps(prev => prev + 1);
  };

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
    <div className="max-w-[44rem] mx-auto px-4 py-8">
      <article className="mb-12">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                  alt={article.profiles?.name}
                />
                <AvatarFallback>{article.profiles?.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{article.profiles?.name}</span>
                  <Button variant="ghost" size="sm" className="text-primary h-8">
                    Follow
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{article.read_time || "5"} min read</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-serif font-bold mb-6 tracking-tight">
            {article.title}
          </h1>

          {article.cover_image && (
            <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none font-serif">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <div className="flex items-center justify-between mt-12 py-6 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClap}
              className="hover:text-primary"
            >
              <span className="text-2xl">👏</span>
            </Button>
            <span className="text-sm text-muted-foreground">{claps}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <span className="text-xl">💬</span>
            </Button>
            <Button variant="ghost" size="icon">
              <span className="text-xl">📤</span>
            </Button>
          </div>
        </div>
      </article>

      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

        {user ? (
          <form className="mb-8">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="mb-4 min-h-[100px]"
            />
            <Button>Post Comment</Button>
          </form>
        ) : (
          <p className="mb-8 text-muted-foreground">
            Please sign in to comment.
          </p>
        )}

        <div className="space-y-6">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback>
                  {comment.profiles?.name?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.profiles?.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}