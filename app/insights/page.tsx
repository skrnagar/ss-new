import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, GraduationCap, Leaf, ShieldCheck, ArrowRight, Bot } from "lucide-react";

export default function InsightsHubPage() {
  return (
    <div className="container max-w-4xl py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Insights</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Dashboard scaffolding for operations KPIs, ESG metrics, and compliance tracking. Data is
        scoped to your account until organization / tenant models are added.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Operations
            </CardTitle>
            <CardDescription>
              Incident log, KPI cards, trends, and Supabase realtime refreshes on the incidents
              table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/insights/operations" className="gap-2">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              ESG
            </CardTitle>
            <CardDescription>
              Monthly metric entries (emissions, energy, water, waste, safety indicators) with
              charts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/insights/esg" className="gap-2">
                ESG dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/40 transition-colors sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Safety Assistant
            </CardTitle>
            <CardDescription>
              AI-powered Q&amp;A for EHS, ESG, and compliance topics (informational only). Uses
              OpenAI with the Vercel AI SDK.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/safety-assistant" className="gap-2">
                Open assistant <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/40 transition-colors sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Compliance tracker
            </CardTitle>
            <CardDescription>
              Obligations, due dates, evidence links, and status workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/compliance" className="gap-2">
                Open compliance <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/learn" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Training (LMS)
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground mt-8">
        AI features need <code className="rounded bg-muted px-1">OPENAI_API_KEY</code> (and optional{" "}
        <code className="rounded bg-muted px-1">OPENAI_MODEL</code>) in the server environment. Run{" "}
        <code className="rounded bg-muted px-1">lib/phase5-dashboards.sql</code> in Supabase before
        using dashboards.
      </p>
    </div>
  );
}
