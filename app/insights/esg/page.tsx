"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { ESG_METRIC_OPTIONS, labelForEsgMetric } from "@/lib/esg-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Row = {
  id: string;
  period_month: string;
  metric_type: string;
  value: number | null;
  unit: string | null;
};

export default function EsgDashboardPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const userId = session?.user?.id;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricType, setMetricType] = useState("scope1_tco2e");
  const [period, setPeriod] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("tCO₂e");

  const load = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("esg_metric_entries")
        .select("id, period_month, metric_type, value, unit")
        .eq("owner_id", userId)
        .order("period_month", { ascending: true });
      if (error) throw error;
      setRows((data as Row[]) || []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const d = ESG_METRIC_OPTIONS.find((m) => m.value === metricType);
    if (d?.defaultUnit) setUnit(d.defaultUnit);
  }, [metricType]);

  async function saveEntry() {
    if (!userId) return;
    const n = Number(value);
    if (Number.isNaN(n)) {
      toast({ title: "Enter a numeric value", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("esg_metric_entries").upsert(
      {
        owner_id: userId,
        period_month: period,
        metric_type: metricType,
        value: n,
        unit,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,period_month,metric_type" }
    );
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Metric saved" });
    setValue("");
    void load();
  }

  const chartByMetric = useMemo(() => {
    const selected = metricType;
    const filtered = rows.filter((r) => r.metric_type === selected);
    return filtered.map((r) => ({
      period: format(new Date(r.period_month), "MMM yy"),
      value: Number(r.value),
    }));
  }, [rows, metricType]);

  if (!userId) {
    return (
      <div className="container py-16 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        for the ESG workspace.
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 px-4 space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          <Link href="/insights" className="hover:text-primary">
            Insights
          </Link>{" "}
          / ESG
        </p>
        <h1 className="text-3xl font-bold tracking-tight">ESG dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Store monthly KPIs and chart progress. Swap in SOC 2 / CSRD reporting fields later without changing
          routing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add / update entry</CardTitle>
            <CardDescription>One value per metric per month (upsert).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Metric</Label>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESG_METRIC_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period (month)</Label>
              <Input type="month" value={period.slice(0, 7)} onChange={(e) => setPeriod(`${e.target.value}-01`)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Value</Label>
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => void saveEntry()}>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trend — {labelForEsgMetric(metricType)}</CardTitle>
            <CardDescription>Entries for the selected metric type</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : chartByMetric.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet for this metric.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartByMetric}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Value" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rows yet.</p>
          ) : (
            <ul className="text-sm divide-y">
              {[...rows]
                .sort((a, b) => b.period_month.localeCompare(a.period_month))
                .slice(0, 12)
                .map((r) => (
                  <li key={r.id} className="py-2 flex justify-between gap-2">
                    <span>{labelForEsgMetric(r.metric_type)}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(r.period_month), "MMM yyyy")} · {r.value} {r.unit}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
