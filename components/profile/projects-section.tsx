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
import { FolderKanban, Globe, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_international: boolean | null;
};

export function ProjectsSection({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    project_url: "",
    start_date: "",
    end_date: "",
    is_international: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profile_projects")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (!error && data) setProjects(data as Project[]);
    else setProjects([]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("profile_projects").insert({
      user_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      project_url: form.project_url.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_international: form.is_international,
    });
    if (error) {
      toast({ title: "Could not save project", description: error.message, variant: "destructive" });
      return;
    }
    setOpen(false);
    setForm({
      title: "",
      description: "",
      project_url: "",
      start_date: "",
      end_date: "",
      is_international: false,
    });
    load();
    toast({ title: "Project added" });
  };

  const remove = async (id: string) => {
    await supabase.from("profile_projects").delete().eq("id", id);
    load();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            Projects & sites
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
            <FolderKanban className="h-5 w-5 text-primary" />
            Projects & sites
          </CardTitle>
          {isOwnProfile && (
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((p) => (
                <li key={p.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    {isOwnProfile && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {p.start_date && <span>From {p.start_date}</span>}
                    {p.end_date && <span>to {p.end_date}</span>}
                    {p.is_international && <span>International</span>}
                  </div>
                  {p.project_url && (
                    <Link
                      href={p.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary inline-flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      Link
                    </Link>
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
            <DialogTitle>Add project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="pt">Title</Label>
              <Input
                id="pt"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="pd">Description</Label>
              <Textarea
                id="pd"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="pu">URL</Label>
              <Input
                id="pu"
                value={form.project_url}
                onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="ps">Start</Label>
                <Input
                  id="ps"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="pe">End</Label>
                <Input
                  id="pe"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_international}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_international: e.target.checked }))
                }
              />
              International / overseas exposure
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
