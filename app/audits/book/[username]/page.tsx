"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function BookAuditorPage({ params }: { params: { username: string } }) {
  const { username } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    scheduled_start: "",
    scheduled_end: "",
    site_address: "",
    site_notes: "",
    scope_summary: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) {
      toast({ title: "Sign in required", variant: "destructive" });
      router.push("/auth/login");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/audits/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditorUsername: username,
          scheduled_start: form.scheduled_start
            ? new Date(form.scheduled_start).toISOString()
            : null,
          scheduled_end: form.scheduled_end ? new Date(form.scheduled_end).toISOString() : null,
          site_address: form.site_address || null,
          site_notes: form.site_notes || null,
          scope_summary: form.scope_summary || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({ title: "Booking requested" });
      router.push(`/audits/booking/${data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast({ title: "Could not create booking", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container max-w-xl py-10 px-4">
      <p className="text-sm text-muted-foreground mb-2">
        <Link href="/audits/find" className="hover:text-primary">
          Find auditors
        </Link>{" "}
        / Book
      </p>
      <h1 className="text-2xl font-bold mb-6">Request audit — @{username}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Preferred start</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_start}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_start: e.target.value }))}
                />
              </div>
              <div>
                <Label>Preferred end</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_end}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_end: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Site / facility address</Label>
              <Input
                value={form.site_address}
                onChange={(e) => setForm((f) => ({ ...f, site_address: e.target.value }))}
                placeholder="Street, city / region"
              />
            </div>
            <div>
              <Label>Scope & standards</Label>
              <Textarea
                value={form.scope_summary}
                onChange={(e) => setForm((f) => ({ ...f, scope_summary: e.target.value }))}
                rows={3}
                placeholder="e.g. ISO 45001 gap audit, site walkdown, contractor review…"
              />
            </div>
            <div>
              <Label>Notes for auditor</Label>
              <Textarea
                value={form.site_notes}
                onChange={(e) => setForm((f) => ({ ...f, site_notes: e.target.value }))}
                rows={2}
                placeholder="Access, PPE, confidentiality…"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Sending…" : "Submit request"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/profile/${username}`}>View profile</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
