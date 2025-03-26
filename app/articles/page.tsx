
import { createLegacyClient } from "@/lib/supabase-server";
import Link from "next/link";
import Image from "next/image";

export default async function ArticlesPage() {
  const supabase = createLegacyClient();
  const { data: articles } = await supabase
    .from("articles")
    .select(`*, author:author_id(name, avatar_url), tags(name)`)
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Articles</h1>
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
                    {article.excerpt || article.content.substring(0, 160)}...
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src={article.author.avatar_url || "/placeholder-user.jpg"}
                        alt={article.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm font-medium">{article.author.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {article.read_time} min read
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
