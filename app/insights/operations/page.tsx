"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Activity, Plus, Radio, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format, startOfMonth, subMonths } from "date-fns";

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  occurred_at: string;
  category: string | null;
};

export default function OperationsDashboardPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const userId = session?.user?.id;
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [live, setLive] = useState(false);
  const [form, setForm] = useState({
    title: "",
    severity: "medium",
    category: "",
    status: "open",
  });
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskHint, setRiskHint] = useState<{
    predicted_risk_band: string;
    contributing_factors: string[];
    suggested_controls: string[];
    disclaimer: string;
  } | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setIncidents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("id, title, severity, status, occurred_at, category")
        .eq("reported_by", userId)
        .order("occurred_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setIncidents((data as Incident[]) || []);
    } catch (e) {
      console.error(e);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`incidents_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incidents",
          filter: `reported_by=eq.${userId}`,
        },
        () => {
          setLive(true);
          void load();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLive(true);
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const open = incidents.filter((i) => i.status !== "closed").length;
    const closedThisMonth = incidents.filter(
      (i) => i.status === "closed" && new Date(i.occurred_at) >= monthStart
    ).length;
    const critical = incidents.filter((i) => i.severity === "critical").length;
    return { open, closedThisMonth, critical, total: incidents.length };
  }, [incidents]);

  const trendData = useMemo(() => {
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      months.push({ month: format(d, "MMM yyyy"), count: 0 });
    }
    for (const inc of incidents) {
      const d = startOfMonth(new Date(inc.occurred_at));
      const key = format(d, "MMM yyyy");
      const row = months.find((m) => m.month === key);
      if (row) row.count++;
    }
    return months;
  }, [incidents]);

  const severityBreakdown = useMemo(() => {
    const m = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const i of incidents) {
      const s = i.severity as keyof typeof m;
      if (s in m) m[s]++;
    }
    return [
      { name: "Low", n: m.low },
      { name: "Medium", n: m.medium },
      { name: "High", n: m.high },
      { name: "Critical", n: m.critical },
    ];
  }, [incidents]);

  async function fetchRiskHint() {
    if (!userId || !form.title.trim()) {
      toast({ title: "Add a title first", variant: "destructive" });
      return;
    }
    setRiskLoading(true);
    setRiskHint(null);
    try {
      const res = await fetch("/api/ai/risk-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category.trim() || undefined,
          currentSeverity: form.severity,
        }),
      });
      const data = (await res.json()) as {
        result?: {
          predicted_risk_band: string;
          contributing_factors: string[];
          suggested_controls: string[];
          disclaimer: string;
        };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (data.result) setRiskHint(data.result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI hint failed";
      toast({ title: "AI risk hint", description: msg, variant: "destructive" });
    } finally {
      setRiskLoading(false);
    }
  }

  async function createIncident() {
    if (!userId || !form.title.trim()) return;
    const { error } = await supabase.from("incidents").insert({
      reported_by: userId,
      title: form.title.trim(),
      severity: form.severity,
      category: form.category.trim() || null,
      status: form.status,
    });
    if (error) {
      toast({
        title: "Could not log incident",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Incident logged" });
    setDialogOpen(false);
    setRiskHint(null);
    setForm({ title: "", severity: "medium", category: "", status: "open" });
    void load();
  }

  if (!userId) {
    return (
      <div className="container py-16 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        for your operations dashboard.
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            <Link href="/insights" className="hover:text-primary">
              Insights
            </Link>{" "}
            / Operations
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Operations &amp; safety KPIs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personal workspace scaffold: log incidents and watch charts update (Supabase realtime
            when RLS allows).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {live && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Radio className="h-3 w-3 animate-pulse" />
              Live sync
            </span>
          )}
          <Dialog
            open={dialogOpen}
            onOpenChange={(o) => {
              setDialogOpen(o);
              if (!o) setRiskHint(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick incident log</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Near miss, injury, property damage…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Severity</Label>
                    <Select
                      value={form.severity}
                      onValueChange={(v) => setForm((f) => ({ ...f, severity: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Category (optional)</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. slips, equipment, contractor"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-fit"
                    disabled={riskLoading || !form.title.trim()}
                    onClick={() => void fetchRiskHint()}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {riskLoading ? "Analyzing…" : "AI risk triage hint"}
                  </Button>
                  {riskHint && (
                    <div className="rounded-md border bg-muted/50 p-3 text-xs space-y-2">
                      <p>
                        <span className="font-medium">Suggested band:</span>{" "}
                        <span className="capitalize">{riskHint.predicted_risk_band}</span>
                      </p>
                      {riskHint.contributing_factors.length > 0 && (
                        <ul className="list-disc pl-4 space-y-0.5">
                          {riskHint.contributing_factors.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      )}
                      {riskHint.suggested_controls.length > 0 && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Controls to consider:</span>{" "}
                          {riskHint.suggested_controls.join("; ")}
                        </p>
                      )}
                      <p className="text-muted-foreground italic">{riskHint.disclaimer}</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => void createIncident()}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{kpis.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Closed (this month)</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{kpis.closedThisMonth}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical (all time)</CardDescription>
            <CardTitle className="text-3xl tabular-nums text-destructive">
              {kpis.critical}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total records</CardDescription>
            <CardTitle className="text-3xl tabular-nums flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              {kpis.total}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incident trend (by month)</CardTitle>
            <CardDescription>Rolling six months from your workspace data</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Severity snapshot</CardTitle>
            <CardDescription>All incidents in your workspace</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="n" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
