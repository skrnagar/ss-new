
import { createLegacyClient } from "@/lib/supabase-server";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createLegacyClient();
  const { data: article } = await supabase
    .from("articles")
    .select(`*, author:author_id(name, avatar_url)`)
    .eq("id", params.id)
    .single();

  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt || article.content.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      images: article.cover_image ? [article.cover_image] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const supabase = createLegacyClient();
  const { data: article } = await supabase
    .from("articles")
    .select(`*, author:author_id(name, avatar_url), tags(name)`)
    .eq("id", params.id)
    .single();

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/profile/${article.author.id}`} className="flex items-center gap-2">
            <Image
              src={article.author.avatar_url || "/placeholder-user.jpg"}
              alt={article.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium">{article.author.name}</span>
          </Link>
          <span className="text-muted-foreground">
            {new Date(article.published_at).toLocaleDateString()}
          </span>
          <span className="text-muted-foreground">{article.read_time} min read</span>
        </div>
        {article.cover_image && (
          <Image
            src={article.cover_image}
            alt={article.title}
            width={1200}
            height={600}
            className="rounded-lg"
            priority
          />
        )}
      </header>

      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <footer className="mt-8 pt-8 border-t">
        <div className="flex gap-2">
          {article.tags?.map((tag: { name: string }) => (
            <Link
              key={tag.name}
              href={`/tags/${tag.name}`}
              className="text-sm bg-muted px-3 py-1 rounded-full hover:bg-muted/80"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </footer>
    </article>
  );
}
