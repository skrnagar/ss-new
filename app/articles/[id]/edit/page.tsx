
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArticleEditor } from "@/components/article-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleResponse, userResponse] = await Promise.all([
          supabase.from("articles_with_author").select("*").eq("id", id).single(),
          supabase.auth.getSession(),
        ]);

        if (articleResponse.error) throw articleResponse.error;
        
        const currentUser = userResponse.data.session?.user;
        if (!currentUser || currentUser.id !== articleResponse.data.author_id) {
          router.push(`/articles/${id}`);
          return;
        }

        setArticle(articleResponse.data);
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching article:", error);
        router.push(`/articles/${id}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
            <Button asChild>
              <Link href="/articles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/articles/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Article
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Edit Article</h1>
          <p className="text-gray-600">Update your article content and settings</p>
        </div>
        
        <ArticleEditor 
          initialContent={article.content}
          initialTitle={article.title}
          initialExcerpt={article.excerpt}
          initialCoverImage={article.cover_image}
          initialCategory={article.category}
          articleId={id as string}
          isEditing={true}
        />
      </div>
    </div>
  );
}
