
"use client";

import { ArticleEditor } from "@/components/article-editor";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchArticle() {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/articles");
        return;
      }

      setArticle(data);
    }

    fetchArticle();
  }, [params.id, router]);

  if (!article) return null;

  return (
    <div className="min-h-screen bg-background">
      <ArticleEditor
        initialContent={article.content}
        initialTitle={article.title}
        articleId={article.id}
      />
    </div>
  );
}
