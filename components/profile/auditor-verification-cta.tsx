"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function AuditorVerificationCta({ status }: { status: string | null | undefined }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const s = status || "none";

  async function request() {
    setLoading(true);
    try {
      const res = await fetch("/api/audits/request-verification", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
      toast({ title: "Request submitted", description: "An admin will review your auditor profile." });
      window.location.reload();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      toast({ title: "Could not submit", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (s === "approved") {
    return (
      <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100">
        Platform auditor verification is <strong>approved</strong>. You can accept audit bookings from the
        directory.
      </div>
    );
  }

  if (s === "pending") {
    return (
      <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Pending review</Badge>
        <span>We’ll email you when verification completes.</span>
      </div>
    );
  }

  if (s === "rejected") {
    return (
      <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm">
        <p>Previous request was not approved. Update your profile and try again if appropriate.</p>
        <Button size="sm" type="button" onClick={() => void request()} disabled={loading}>
          {loading ? "Sending…" : "Request verification again"}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-3 text-sm space-y-2">
      <p>
        Request <strong>platform verification</strong> to appear in the public auditor directory and receive
        booking requests.
      </p>
      <Button size="sm" type="button" onClick={() => void request()} disabled={loading}>
        {loading ? "Submitting…" : "Request auditor verification"}
      </Button>
    </div>
  );
}
