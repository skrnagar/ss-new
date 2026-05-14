"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

type Rev = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function AuditorReviewsSection({ auditorId }: { auditorId: string }) {
  const [reviews, setReviews] = useState<Rev[]>([]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { data } = await supabase
        .from("audit_reviews")
        .select("id, rating, comment, created_at")
        .eq("auditor_id", auditorId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!ignore) setReviews((data as Rev[]) || []);
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [auditorId]);

  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          Audit reviews
          <span className="text-sm font-normal text-muted-foreground">
            ({avg.toFixed(1)} avg · {reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border-b last:border-0 pb-3 last:pb-0 text-sm">
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
