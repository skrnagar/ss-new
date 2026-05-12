"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Plus, Sparkles, ThumbsUp, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type SkillRow = {
  id: string;
  name: string;
  proficiency: number | null;
  industry_tag: string | null;
  endorsements: number;
};

export function SkillsEndorsementsSection({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from("profile_skills")
        .select("id, name, proficiency, industry_tag")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        if (
          error.code === "42P01" ||
          error.message?.toLowerCase().includes("does not exist")
        ) {
          setSkills([]);
          return;
        }
        throw error;
      }

      const withCounts = await Promise.all(
        (rows || []).map(async (s) => {
          const { count } = await supabase
            .from("profile_skill_endorsements")
            .select("*", { count: "exact", head: true })
            .eq("skill_id", s.id);
          return { ...s, endorsements: count ?? 0 };
        })
      );

      setSkills(withCounts);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const addSkill = async () => {
    const name = newSkill.trim();
    if (!name || !session?.user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profile_skills").insert({
        user_id: userId,
        name,
        proficiency: 3,
      });
      if (error) throw error;
      setNewSkill("");
      toast({ title: "Skill added" });
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not add skill";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const endorse = async (skillId: string) => {
    if (!session?.user || session.user.id === userId) return;
    try {
      const { error } = await supabase.from("profile_skill_endorsements").insert({
        skill_id: skillId,
        endorser_id: session.user.id,
      });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already endorsed this skill" });
          return;
        }
        throw error;
      }
      toast({ title: "Endorsement added" });
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not endorse";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const removeSkill = async (skillId: string) => {
    if (!isOwnProfile) return;
    const { error } = await supabase.from("profile_skills").delete().eq("id", skillId);
    if (!error) load();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Skills & endorsements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Skills & endorsements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwnProfile && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g. ISO 45001, HAZOP)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <Button type="button" size="sm" onClick={addSkill} disabled={saving || !newSkill.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills listed yet.</p>
        ) : (
          <ul className="space-y-3">
            {skills.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Level {s.proficiency ?? 3}/5
                  </Badge>
                  {s.industry_tag && (
                    <Badge variant="secondary" className="text-xs">
                      {s.industry_tag}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {s.endorsements} endorsement{s.endorsements === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {!isOwnProfile && session?.user && session.user.id !== userId && (
                    <Button type="button" variant="outline" size="sm" onClick={() => endorse(s.id)}>
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Endorse
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
