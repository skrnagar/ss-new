
import { createLegacyClient } from "@/lib/supabase-server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function ArticlesPage() {
  const supabase = createLegacyClient();
  const { data: articles } = await supabase
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button asChild>
          <Link href="/articles/create">
            <Plus className="h-4 w-4 mr-2" />
            Write Article
          </Link>
        </Button>
      </div>

      <div className="grid gap-8">
        {articles?.map((article) => (
          <article key={article.id} className="group">
            <Link href={`/articles/${article.id}`}>
              <div className="grid md:grid-cols-3 gap-6">
                {article.cover_image && (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={article.cover_image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className={article.cover_image ? "md:col-span-2" : "md:col-span-3"}>
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-primary">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {article.excerpt || article.content?.substring(0, 160)}...
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                        alt={article.profiles?.full_name || "Author"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">
                        {article.profiles?.full_name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
