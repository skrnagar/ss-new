"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

type Booking = {
  id: string;
  client_id: string;
  auditor_id: string;
  status: string;
  scheduled_start: string | null;
  site_address: string | null;
  scope_summary: string | null;
  created_at: string;
};

export default function MyAuditBookingsPage() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/audits/bookings");
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
      else setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!session?.user) {
    return (
      <div className="container py-16 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        to see your audit bookings.
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 px-4">
      <p className="text-sm text-muted-foreground mb-2">
        <Link href="/audits" className="hover:text-primary">
          Audits
        </Link>{" "}
        / Bookings
      </p>
      <h1 className="text-2xl font-bold mb-6">My audit bookings</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No bookings yet.{" "}
            <Link href="/audits/find" className="text-primary underline">
              Find an auditor
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    <Link href={`/audits/booking/${b.id}`} className="hover:underline">
                      Engagement
                    </Link>
                  </CardTitle>
                  <Badge variant={b.status === "completed" ? "default" : "secondary"}>{b.status}</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {b.scheduled_start && (
                    <p>{new Date(b.scheduled_start).toLocaleString()}</p>
                  )}
                  {b.site_address && <p>{b.site_address}</p>}
                  {b.scope_summary && <p className="line-clamp-2">{b.scope_summary}</p>}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
