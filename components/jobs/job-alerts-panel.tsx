"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Bell, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AlertRow = {
  id: string;
  keywords: string[] | null;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  industry: string | null;
  frequency: string | null;
  is_active: boolean | null;
};

export function JobAlertsPanel() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<AlertRow[]>([]);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  const userId = session?.user?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setList(data as AlertRow[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Create an account to save job alerts.",
        variant: "destructive",
      });
      return;
    }
    const kw = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (kw.length === 0) {
      toast({
        title: "Add keywords",
        description:
          "Enter at least one keyword (comma separated), e.g. Safety Manager, ISO 45001.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("job_alerts").insert({
      user_id: userId,
      keywords: kw,
      location: location.trim() || null,
      employment_type: employmentType || null,
      experience_level: experienceLevel || null,
      industry: industry.trim() || null,
      frequency: "daily",
      is_active: true,
    });

    setSaving(false);

    if (error) {
      if (error.code === "42P01" || error.message?.toLowerCase().includes("does not exist")) {
        toast({
          title: "Database setup",
          description: "Run lib/jobs-schema.sql and lib/phase3-recruitment.sql in Supabase.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setKeywords("");
    setLocation("");
    setEmploymentType("");
    setExperienceLevel("");
    setIndustry("");
    load();
    toast({
      title: "Alert saved",
      description:
        "You'll get in-app notifications when new jobs match. Email uses Resend when configured (see Settings).",
    });
  };

  const remove = async (id: string) => {
    await supabase.from("job_alerts").delete().eq("id", id);
    load();
  };

  if (!userId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Job alerts
          </CardTitle>
          <CardDescription>Sign in to get notified when jobs match your criteria.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Job alerts
        </CardTitle>
        <CardDescription>
          Matches create in-app notifications. Email uses Resend when configured; turn job emails on
          or off in{" "}
          <Link href="/settings" className="text-primary underline">
            Settings → Notifications
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Keywords (comma separated) *</Label>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. Safety Officer, HAZOP, Lead Auditor"
          />
        </div>
        <div className="space-y-2">
          <Label>Location contains</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or region"
          />
        </div>
        <div className="space-y-2">
          <Label>Sector / industry contains</Label>
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Chemical, Oil & Gas"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Employment</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm h-10"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">Any</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
          <div>
            <Label>Experience</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm h-10"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="">Any</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>
        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save alert"}
        </Button>

        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Your alerts</p>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts yet.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between gap-2 text-xs border rounded-md p-2 items-start"
                >
                  <span>
                    {(a.keywords || []).join(", ")}
                    {a.location && ` · ${a.location}`}
                    {a.industry && ` · ${a.industry}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => remove(a.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
