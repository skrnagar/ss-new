
"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export function SearchArticles() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);

  useEffect(() => {
    fetchTrendingTags();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      searchArticles();
    }
  }, [query]);

  const searchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles:author_id(name, avatar_url),
        tags(name)
      `)
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
  };

  const fetchTrendingTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('name, articles!articles_tags(count)')
      .order('articles(count)', { ascending: false })
      .limit(10);

    if (!error && data) {
      setTrendingTags(data);
    }
  };

  return (
    <div className="space-y-6">
      <Input
        type="search"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      {query.length > 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          {articles.map((article: any) => (
            <Link 
              href={`/articles/${article.id}`}
              key={article.id}
              className="block p-4 border rounded-lg hover:bg-muted"
            >
              <h3 className="font-semibold">{article.title}</h3>
              <p className="text-sm text-muted-foreground">
                by {article.profiles.name}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Trending Tags</h2>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag: any) => (
            <Link
              key={tag.name}
              href={`/tags/${tag.name}`}
              className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
