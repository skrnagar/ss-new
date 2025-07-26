"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  MoreHorizontal, 
  Bookmark, 
  Heart, 
  MessageCircle, 
  Clock, 
  Eye, 
  ArrowLeft,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  Edit
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [claps, setClaps] = useState(0);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleResponse, commentsResponse, userResponse] = await Promise.all([
          supabase.from("articles_with_author").select("*").eq("id", id).single(),
          supabase
            .from("comments")
            .select("*, profiles:profiles(*)")
            .eq("article_id", id)
            .order("created_at", { ascending: false }),
          supabase.auth.getSession(),
        ]);

        if (articleResponse.error) throw articleResponse.error;
        setArticle(articleResponse.data);
        setComments(commentsResponse.data || []);
        setUser(userResponse.data.session?.user || null);
        setClaps(articleResponse.data.claps || 0);
        setIsAuthor(userResponse.data.session?.user?.id === articleResponse.data?.author_id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        article_id: id,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select("*, profiles:profiles(*)")
      .single();

    if (!error && data) {
      setComments([data, ...comments]);
      setNewComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    }
  };

  const handleClap = async () => {
    try {
      setClaps((prev) => prev + 1);
      setIsLiked(true);
      await supabase
        .from("articles")
        .update({ claps: claps + 1 })
        .eq("id", id);
    } catch (error) {
      console.error("Error updating claps:", error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Article removed from your bookmarks." : "Article saved to your bookmarks.",
    });
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = article?.title || "Check out this article";
    
    try {
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
          break;
        default:
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast({
            title: "Link copied",
            description: "Article link copied to clipboard.",
          });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-48 mb-8" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h1>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/articles">Back to Articles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare()}
                className="h-8 w-8 p-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`h-8 w-8 p-0 ${isBookmarked ? 'text-primary' : ''}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href={`/articles/${article.id}/edit`}>Edit article</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this article?")) {
                          try {
                            const { error } = await supabase
                              .from("articles")
                              .delete()
                              .eq("id", article.id);

                            if (error) throw error;
                            router.push("/articles");
                          } catch (error) {
                            console.error("Error deleting article:", error);
                          }
                        }
                      }}
                    >
                      Delete article
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="mb-16">
          {/* Article Header */}
          <header className="mb-12">
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary text-sm font-medium px-3 py-1">
                  {article.category || "General"}
                </Badge>
                {user?.id === article.author_id && (
                  <Button asChild variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                    <Link href={`/articles/${article.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Article
                    </Link>
                  </Button>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 text-gray-900 leading-tight tracking-tight">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-l sm:text-xl text-gray-600 mb-8 leading-relaxed font-light">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Author Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
              <div className="flex items-center gap-6">
                <Link
                  href={`/profile/${article.author_id}`}
                  className="flex items-center gap-6 hover:opacity-80 transition-opacity group"
                >
                  <Avatar className="h-16 w-16 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                    <AvatarImage src={article.author_avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                      {article.author_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-xl mb-1">{article.author_name}</h2>
                    <div className="text-gray-600 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm">{article.read_time || "5"} min read</span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClap}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLiked ? 'text-red-500 bg-red-50' : 'hover:bg-gray-100'}`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{claps}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{comments.length}</span>
                </Button>
              </div>
            </div>

            {/* Cover Image */}
            {article.cover_image && (
              <div className="relative aspect-[21/9] w-full mb-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/article-covers/${article.cover_image}`}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div
            className="prose prose-lg sm:prose-xl lg:prose-2xl max-w-none 
              prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight 
              prose-h1:text-3xl sm:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-8 prose-h1:mt-10
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-8
              prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
              prose-h4:text-lg sm:prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-4
              prose-h5:text-base sm:prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg sm:prose-p:text-xl prose-p:mb-8 prose-p:mt-0
              prose-a:text-primary prose-a:underline prose-a:decoration-primary/30 prose-a:underline-offset-2 hover:prose-a:decoration-primary 
              prose-strong:text-gray-900 prose-strong:font-semibold 
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/5 prose-blockquote:to-primary/10 prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:rounded-r-xl prose-blockquote:my-12 prose-blockquote:italic prose-blockquote:text-lg
              prose-ul:my-8 prose-ol:my-8 prose-li:mb-3 prose-li:text-lg prose-li:leading-relaxed
              prose-hr:my-16 prose-hr:border-gray-200 prose-hr:border-2
              prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-12 prose-img:max-w-full prose-img:h-auto
              prose-figure:my-12 prose-figcaption:text-center prose-figcaption:text-gray-500 prose-figcaption:text-sm prose-figcaption:mt-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Share Section */}
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Share this article</h3>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare()}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="border-t pt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {comments.length}
            </Badge>
          </div>

          {user ? (
            <Card className="mb-8 border-0 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmitComment}>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this article..."
                    className="mb-4 min-h-[100px] resize-none border-gray-200 focus:border-primary"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!newComment.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Join the conversation</h3>
                <p className="text-gray-600 mb-4">Sign in to leave a comment and engage with the community.</p>
                <Button asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {comments.map((comment) => (
              <Card key={comment.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {comment.profiles?.name?.substring(0, 2)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{comment.profiles?.name}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600">Be the first to share your thoughts on this article.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
