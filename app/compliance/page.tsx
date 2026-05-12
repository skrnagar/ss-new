"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus } from "lucide-react";
import { format } from "date-fns";

type Item = {
  id: string;
  title: string;
  framework: string | null;
  due_date: string | null;
  status: string;
  notes: string | null;
  evidence_url: string | null;
};

export default function ComplianceTrackerPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const userId = session?.user?.id;
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    framework: "",
    due_date: "",
    status: "not_started",
    notes: "",
    evidence_url: "",
  });

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("compliance_items")
      .select("id, title, framework, due_date, status, notes, evidence_url")
      .eq("owner_id", userId)
      .order("due_date", { ascending: true, nullsFirst: false });
    setItems((data as Item[]) || []);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createItem() {
    if (!userId || !form.title.trim()) return;
    const { error } = await supabase.from("compliance_items").insert({
      owner_id: userId,
      title: form.title.trim(),
      framework: form.framework.trim() || null,
      due_date: form.due_date || null,
      status: form.status,
      notes: form.notes.trim() || null,
      evidence_url: form.evidence_url.trim() || null,
    });
    if (error) {
      toast({ title: "Could not add", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Obligation added" });
    setOpen(false);
    setForm({
      title: "",
      framework: "",
      due_date: "",
      status: "not_started",
      notes: "",
      evidence_url: "",
    });
    void load();
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("compliance_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
      return;
    }
    void load();
  }

  if (!userId) {
    return (
      <div className="container py-16 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        for the compliance tracker.
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            <Link href="/insights" className="hover:text-primary">
              Insights
            </Link>{" "}
            / Compliance
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Compliance tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track obligations, due dates, evidence, and status in your workspace.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add obligation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New obligation</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Framework / standard</Label>
                <Input
                  value={form.framework}
                  onChange={(e) => setForm((f) => ({ ...f, framework: e.target.value }))}
                  placeholder="ISO 45001, OSHA, Tier II…"
                />
              </div>
              <div>
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Evidence URL</Label>
                <Input
                  value={form.evidence_url}
                  onChange={(e) => setForm((f) => ({ ...f, evidence_url: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => void createItem()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Obligations</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Framework</th>
                    <th className="py-2 pr-4">Due</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="py-3 pr-4 font-medium">{row.title}</td>
                      <td className="py-3 pr-4">{row.framework || "—"}</td>
                      <td className="py-3 pr-4">
                        {row.due_date ? format(new Date(row.due_date), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Select
                          value={row.status}
                          onValueChange={(v) => void updateStatus(row.id, v)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not started</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3">
                        {row.evidence_url ? (
                          <a
                            href={row.evidence_url}
                            className="text-primary underline text-xs"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Link
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
