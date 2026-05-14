"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Search, MapPin, BadgeCheck, Users, Briefcase, Shield } from "lucide-react";

type Audience = "recruiter" | "auditor";

type CandidateRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  headline: string | null;
  location: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  skills: string[];
};

export default function TalentSearchPage() {
  const [audience, setAudience] = useState<Audience>("recruiter");
  const [skillQuery, setSkillQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CandidateRow[]>([]);

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      let profileIds: string[] | null = null;

      if (skillQuery.trim()) {
        const q = skillQuery.trim();
        const { data: skills, error: skErr } = await supabase
          .from("profile_skills")
          .select("user_id")
          .ilike("name", `%${q}%`);
        if (skErr) throw skErr;
        profileIds = [...new Set((skills || []).map((s) => s.user_id))];
        if (profileIds.length === 0) {
          setResults([]);
          return;
        }
      }

      let query = supabase
        .from("profiles")
        .select(
          "id, username, full_name, headline, location, avatar_url, verified, recruiter_visible, auditor_visible, is_profile_public"
        )
        .eq("is_profile_public", true);

      if (audience === "recruiter") {
        query = query.or("recruiter_visible.is.null,recruiter_visible.eq.true");
      } else {
        query = query.or("auditor_visible.is.null,auditor_visible.eq.true");
      }

      if (profileIds) {
        query = query.in("id", profileIds);
      }

      if (locationFilter.trim()) {
        query = query.ilike("location", `%${locationFilter.trim()}%`);
      }

      if (nameQuery.trim()) {
        const n = nameQuery.trim();
        query = query.or(`full_name.ilike.%${n}%,username.ilike.%${n}%`);
      }

      query = query.order("created_at", { ascending: false }).limit(60);

      const { data: profiles, error: pErr } = await query;
      if (pErr) throw pErr;

      const list = profiles || [];
      const ids = list.map((p) => p.id);

      const skillMap = new Map<string, string[]>();
      if (ids.length > 0) {
        const { data: allSkills, error: e2 } = await supabase
          .from("profile_skills")
          .select("user_id, name")
          .in("user_id", ids);
        if (!e2 && allSkills) {
          for (const row of allSkills) {
            const prev = skillMap.get(row.user_id) || [];
            if (prev.length < 10) {
              prev.push(row.name);
            }
            skillMap.set(row.user_id, prev);
          }
        }
      }

      setResults(
        list.map((p) => ({
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          headline: p.headline,
          location: p.location,
          avatar_url: p.avatar_url,
          verified: p.verified,
          skills: skillMap.get(p.id) || [],
        }))
      );
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [audience, skillQuery, locationFilter, nameQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      void runSearch();
    }, 320);
    return () => clearTimeout(t);
  }, [runSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/jobs" className="hover:text-primary">
              Jobs
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">Talent search</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Find professionals
          </h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Search public profiles by skill. Respects each member&apos;s recruiter and auditor visibility
            settings on their profile header.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {audience === "recruiter" ? (
                <Briefcase className="h-5 w-5 text-primary" />
              ) : (
                <Shield className="h-5 w-5 text-primary" />
              )}
              Filters
            </CardTitle>
            <CardDescription>
              Matching skill names use a partial, case-insensitive match on profile skills.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Directory</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={audience === "recruiter" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudience("recruiter")}
                >
                  Recruiting view
                </Button>
                <Button
                  type="button"
                  variant={audience === "auditor" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudience("auditor")}
                >
                  Auditor view
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Skill contains…"
                  value={skillQuery}
                  onChange={(e) => setSkillQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Name or username"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Location contains…"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>

            <Button type="button" variant="secondary" onClick={() => void runSearch()} disabled={loading}>
              {loading ? "Searching…" : "Refresh"}
            </Button>
          </CardContent>
        </Card>

        {loading && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading profiles…</p>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No profiles matched. Try another skill or clear filters.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {results.map((c) => (
              <li key={c.id}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={c.avatar_url || undefined} alt="" />
                        <AvatarFallback>
                          {(c.full_name || c.username || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {c.username ? (
                            <Link
                              href={`/profile/${c.username}`}
                              className="font-semibold text-lg text-gray-900 hover:text-primary"
                            >
                              {c.full_name || c.username || "Member"}
                            </Link>
                          ) : (
                            <span className="font-semibold text-lg text-gray-900">
                              {c.full_name || "Member"}
                            </span>
                          )}
                          {c.verified === true && (
                            <BadgeCheck className="h-5 w-5 text-primary" aria-label="Verified" />
                          )}
                        </div>
                        {c.username && (
                          <p className="text-sm text-muted-foreground">@{c.username}</p>
                        )}
                        {c.headline && (
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{c.headline}</p>
                        )}
                        {c.location && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {c.location}
                          </p>
                        )}
                        {c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {c.skills.slice(0, 6).map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {c.username && (
                        <Button asChild variant="outline" size="sm" className="self-center flex-shrink-0">
                          <Link href={`/profile/${c.username}`}>View profile</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
