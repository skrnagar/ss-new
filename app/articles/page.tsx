
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

      <div className="flex gap-8">
        <div className="flex-1">
          <div className="space-y-8">
            {articles?.map((article) => (
              <article key={article.id} className="group">
                <Link href={`/articles/${article.id}`}>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-primary">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt || article.content?.substring(0, 160)}...
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Image
                            src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                            alt={article.profiles?.full_name || "Author"}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <span className="text-muted-foreground">
                            {article.profiles?.full_name}
                          </span>
                        </div>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{article.read_time || '5'} min read</span>
                      </div>
                    </div>
                    {article.cover_image && (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                          src={article.cover_image}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="w-80 hidden lg:block">
          <div className="sticky top-8">
            <h3 className="font-semibold mb-4">Staff Picks</h3>
            <div className="space-y-4">
              {articles?.slice(0, 3).map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`} className="block group">
                  <div className="flex items-start gap-3">
                    <Image
                      src={article.profiles?.avatar_url || "/placeholder-user.jpg"}
                      alt={article.profiles?.full_name || "Author"}
                      width={24}
                      height={24}
                      className="rounded-full mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium group-hover:text-primary">
                        {article.profiles?.full_name}
                      </span>
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                        {article.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
