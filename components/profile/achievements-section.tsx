"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Award, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Achievement = {
  id: string;
  title: string;
  description: string | null;
  achieved_at: string | null;
  award_url: string | null;
};

export function AchievementsSection({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<Achievement[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    achieved_at: "",
    award_url: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profile_achievements")
      .select("*")
      .eq("user_id", userId)
      .order("achieved_at", { ascending: false });

    if (!error && data) setItems(data as Achievement[]);
    else setItems([]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("profile_achievements").insert({
      user_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      achieved_at: form.achieved_at || null,
      award_url: form.award_url.trim() || null,
    });
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setOpen(false);
    setForm({ title: "", description: "", achieved_at: "", award_url: "" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("profile_achievements").delete().eq("id", id);
    load();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements & awards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements & awards
          </CardTitle>
          {isOwnProfile && (
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No achievements listed.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((a) => (
                <li key={a.id} className="border rounded-lg p-3 flex justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{a.title}</h3>
                    {a.description && (
                      <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    )}
                    {a.achieved_at && (
                      <p className="text-xs text-muted-foreground mt-1">{a.achieved_at}</p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add achievement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.achieved_at}
                onChange={(e) => setForm((f) => ({ ...f, achieved_at: e.target.value }))}
              />
            </div>
            <div>
              <Label>Link</Label>
              <Input
                value={form.award_url}
                onChange={(e) => setForm((f) => ({ ...f, award_url: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
