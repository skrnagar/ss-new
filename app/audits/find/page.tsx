"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditorsMap, type AuditorMapPin } from "@/components/audits/auditors-map";
import { haversineKm } from "@/lib/haversine";
import { MapPin, Navigation, Shield } from "lucide-react";

type AuditorRow = AuditorMapPin & {
  headline: string | null;
  location: string | null;
  auditor_services_summary: string | null;
};

export default function FindAuditorsPage() {
  const [auditors, setAuditors] = useState<AuditorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(200);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, full_name, headline, location, latitude, longitude, auditor_services_summary"
        )
        .eq("professional_role", "auditor")
        .eq("auditor_verification_status", "approved")
        .eq("is_profile_public", true)
        .or("auditor_visible.is.null,auditor_visible.eq.true")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setAuditors((data as AuditorRow[]) || []);
    } catch (e) {
      console.error(e);
      setAuditors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError(null);
      },
      (err) => setGeoError(err.message || "Location denied")
    );
  }, []);

  const filtered = auditors.filter((a) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const blob = `${a.full_name || ""} ${a.username || ""} ${a.headline || ""} ${a.location || ""} ${a.auditor_services_summary || ""}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (userPos && a.latitude != null && a.longitude != null) {
      const d = haversineKm(userPos.lat, userPos.lng, a.latitude, a.longitude);
      if (d > radiusKm) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!userPos) return 0;
    if (a.latitude == null || a.longitude == null) return 1;
    if (b.latitude == null || b.longitude == null) return -1;
    const da = haversineKm(userPos.lat, userPos.lng, a.latitude, a.longitude);
    const db = haversineKm(userPos.lat, userPos.lng, b.latitude, b.longitude);
    return da - db;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              <Link href="/audits" className="hover:text-primary">
                Audits
              </Link>{" "}
              / Find
            </p>
            <h1 className="text-3xl font-bold">Verified auditors</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Only profiles with admin-approved auditor verification appear here.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/audits/my-bookings">My bookings</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search & radius</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Name, skills, location keywords…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Radius (km)</span>
                <select
                  className="rounded-md border border-input bg-background px-2 py-2 text-sm h-9"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={10000}>Global</option>
                </select>
                {userPos ? (
                  <Badge variant="secondary" className="gap-1">
                    <Navigation className="h-3 w-3" />
                    Using your location for sorting & filter
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {geoError || "Allow location to sort by distance (optional)."}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          <div>
            <AuditorsMap
              auditors={sorted}
              center={userPos ?? undefined}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              No auditors match your filters. Try widening the radius or clearing search.
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {sorted.map((a) => {
              const dist =
                userPos && a.latitude != null && a.longitude != null
                  ? haversineKm(userPos.lat, userPos.lng, a.latitude, a.longitude)
                  : null;
              return (
                <li key={a.id}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                        {a.full_name || a.username}{" "}
                        <Badge variant="outline" className="gap-1 font-normal">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      </CardTitle>
                      {a.username && (
                        <p className="text-xs text-muted-foreground">@{a.username}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {a.headline && <p className="text-muted-foreground">{a.headline}</p>}
                      {a.location && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {a.location}
                          {dist != null && (
                            <span className="text-xs"> · ~{dist.toFixed(0)} km</span>
                          )}
                        </p>
                      )}
                      {a.auditor_services_summary && (
                        <p className="line-clamp-3">{a.auditor_services_summary}</p>
                      )}
                      {a.username && (
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" asChild>
                            <Link href={`/audits/book/${a.username}`}>Request booking</Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/profile/${a.username}`}>Profile</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
