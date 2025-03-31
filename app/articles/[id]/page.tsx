"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Share2, MoreHorizontal, Bookmark, Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Retained from original
import { Textarea } from "@/components/ui/textarea"; // Retained from original


export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]); // Retained from original
  const [newComment, setNewComment] = useState(""); // Retained from original
  const [user, setUser] = useState(null); // Retained from original
  const [claps, setClaps] = useState(0);


  useEffect(() => {
    async function fetchData() {
      try {
        const [articleResponse, commentsResponse, userResponse] = await Promise.all([
          supabase
            .from("articles_with_author")
            .select("*")
            .eq("id", id)
            .single(),
          supabase
            .from("comments")
            .select(`*, profiles:profiles(*)`)
            .eq("article_id", id)
            .order("created_at", { ascending: false }),
          supabase.auth.getSession()
        ]);

        if (articleResponse.error) throw articleResponse.error;
        setArticle(articleResponse.data);
        setComments(commentsResponse.data || []);
        setUser(userResponse.data.session?.user || null);
        setClaps(articleResponse.data.claps || 0); // Simplified clap fetching
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSubmitComment = async (e) => { // Retained from original
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        article_id: id,
        user_id: user.id,
        content: newComment.trim()
      })
      .select(`*, profiles:profiles(*)`)
      .single();

    if (!error && data) {
      setComments([data, ...comments]);
      setNewComment("");
    }
  };

  const handleClap = async () => {
    try {
      setClaps(prev => prev + 1);
      await supabase
        .from("articles")
        .update({ claps: claps + 1 })
        .eq("id", id);
    } catch (error) {
      console.error("Error updating claps:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">{article.title}</h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${article.profiles?.username}`} className="flex items-center gap-3 hover:opacity-80">
                <Image
                  src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                  alt={article.profiles?.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">{article.profiles?.name}</h2>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                    <span>·</span>
                    <span>{article.read_time || "5"} min read</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClap}>
                <Heart className="h-5 w-5 mr-1" />
                <span>{claps}</span>
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {article.cover_image && (
            <div className="relative aspect-video w-full mb-8 bg-gray-100 rounded-lg overflow-hidden">
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

        <div className="prose prose-lg max-w-none">
          {/* dangerouslySetInnerHTML removed for security.  Directly using article.content */}
          {article.content}
        </div>
      </article>

      <div className="border-t pt-8"> {/*Comment Section Retained from Original*/}
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