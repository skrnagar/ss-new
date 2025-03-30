
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
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data: article } = await supabase
        .from("articles_with_author")
        .select("*")
        .eq("id", id)
        .single();
      setArticle(article);
    };

    const fetchComments = async () => {
      const { data: comments } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:profiles(*)
        `)
        .eq("article_id", id)
        .order("created_at", { ascending: false });
      setComments(comments || []);
    };

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchArticle();
    fetchComments();
    getUser();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        article_id: id,
        user_id: user.id,
        content: newComment.trim()
      })
      .select(`
        *,
        profiles:profiles(*)
      `)
      .single();

    if (!error && data) {
      setComments([data, ...comments]);
      setNewComment("");
    }
  };

  if (!article) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Existing article content */}
      
      {/* Comments section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="mb-4"
            />
            <Button type="submit">Post Comment</Button>
          </form>
        ) : (
          <p className="mb-8 text-muted-foreground">Please sign in to comment.</p>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
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
      </div>
    </div>
  );
}
