"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseSqlEditorUrl } from "@/lib/knowledge-utils";
import { PRODUCTION_BOOTSTRAP_HINT } from "@/lib/schema-utils";
import { AlertTriangle } from "lucide-react";

type SchemaSetupCardProps = {
  title: string;
  description: string;
  scriptHint?: string;
  onRefresh: () => void;
};

export function SchemaSetupCard({
  title,
  description,
  scriptHint = "lib/production/*.sql (or npm run db:bootstrap)",
  onRefresh,
}: SchemaSetupCardProps) {
  const sqlEditorUrl = getSupabaseSqlEditorUrl();

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-amber-950 dark:text-amber-100">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-amber-950/90 dark:text-amber-100/90">
        <p>{description}</p>
        <ol className="mx-auto max-w-xl list-decimal space-y-2 pl-5 text-left">
          <li>
            From the project root, run{" "}
            <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs text-foreground dark:bg-black/30">
              npm run db:bootstrap
            </code>{" "}
            (uses <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
            <code className="text-xs">.env.local</code>).
          </li>
          <li>
            Or in Supabase <strong>SQL Editor</strong>, run scripts under{" "}
            <code className="break-all rounded bg-white/90 px-1.5 py-0.5 text-xs text-foreground dark:bg-black/30">
              {scriptHint}
            </code>
            .
          </li>
          <li>
            Then click <strong>Refresh</strong> below.
          </li>
        </ol>
        <p className="text-xs opacity-80">{PRODUCTION_BOOTSTRAP_HINT}</p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {sqlEditorUrl ? (
            <Button asChild size="sm">
              <a href={sqlEditorUrl} target="_blank" rel="noopener noreferrer">
                Open Supabase SQL Editor
              </a>
            </Button>
          ) : null}
          <Button type="button" variant="secondary" size="sm" onClick={() => void onRefresh()}>
            I ran the setup — refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
