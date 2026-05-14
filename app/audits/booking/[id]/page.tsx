"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Booking = {
  id: string;
  client_id: string;
  auditor_id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  site_address: string | null;
  site_notes: string | null;
  scope_summary: string | null;
};

type CheckItem = {
  id: string;
  booking_id: string;
  sort_order: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  notes: string | null;
};

type EvidenceRow = {
  id: string;
  booking_id: string;
  checklist_item_id: string | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  created_at: string;
};

export default function AuditBookingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { session } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [items, setItems] = useState<CheckItem[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [clientName, setClientName] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDone, setReviewDone] = useState(false);

  const uid = session?.user?.id;

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: b, error: bErr } = await supabase
        .from("audit_bookings")
        .select("*")
        .eq("id", id)
        .single();
      if (bErr || !b) {
        setBooking(null);
        return;
      }
      setBooking(b as Booking);

      const [{ data: ch }, { data: ev }, { data: rev }] = await Promise.all([
        supabase.from("audit_checklist_items").select("*").eq("booking_id", id).order("sort_order"),
        supabase.from("audit_evidence").select("*").eq("booking_id", id).order("created_at", { ascending: false }),
        supabase.from("audit_reviews").select("id").eq("booking_id", id).maybeSingle(),
      ]);
      setItems((ch as CheckItem[]) || []);
      setEvidence((ev as EvidenceRow[]) || []);
      setReviewDone(!!rev);

      const [cRes, aRes] = await Promise.all([
        supabase.from("profiles").select("full_name,username").eq("id", b.client_id).single(),
        supabase.from("profiles").select("full_name,username").eq("id", b.auditor_id).single(),
      ]);
      const c = cRes.data;
      const a = aRes.data;
      setClientName(c?.full_name || c?.username || "Client");
      setAuditorName(a?.full_name || a?.username || "Auditor");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const isClient = uid && booking?.client_id === uid;
  const isAuditor = uid && booking?.auditor_id === uid;

  async function doAction(action: string) {
    const res = await fetch(`/api/audits/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ title: "Action failed", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: "Updated" });
    void load();
  }

  async function toggleItem(item: CheckItem, checked: boolean) {
    if (!uid) return;
    const { error } = await supabase
      .from("audit_checklist_items")
      .update({
        is_completed: checked,
        completed_at: checked ? new Date().toISOString() : null,
        completed_by: checked ? uid : null,
      })
      .eq("id", item.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              is_completed: checked,
            }
          : i
      )
    );
  }

  async function saveItemNotes(itemId: string, notes: string) {
    const { error } = await supabase.from("audit_checklist_items").update({ notes }).eq("id", itemId);
    if (error) {
      toast({ title: "Could not save notes", variant: "destructive" });
      return;
    }
    toast({ title: "Notes saved" });
  }

  async function openEvidence(path: string) {
    const { data, error } = await supabase.storage.from("audit-evidence").createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      toast({ title: "Could not open file", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function uploadFile(file: File, checklistItemId: string | null) {
    if (!uid || !booking) return;
    const safe = file.name.replace(/[^a-z0-9._-]/gi, "_");
    const path = `${booking.id}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from("audit-evidence").upload(path, file);
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const { error: insErr } = await supabase.from("audit_evidence").insert({
      booking_id: booking.id,
      checklist_item_id: checklistItemId,
      file_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      uploaded_by: uid,
    });
    if (insErr) {
      toast({ title: "Metadata save failed", description: insErr.message, variant: "destructive" });
      return;
    }
    toast({ title: "Evidence uploaded" });
    void load();
  }

  async function submitReview() {
    const res = await fetch("/api/audits/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: id,
        rating: reviewRating,
        comment: reviewComment,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ title: "Review failed", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: "Thank you for your review" });
    setReviewDone(true);
  }

  if (loading) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!booking) {
    return (
      <div className="container py-16 text-sm">
        Booking not found or you do not have access.{" "}
        <Link href="/audits/my-bookings" className="text-primary underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 px-4 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            <Link href="/audits/my-bookings" className="hover:text-primary">
              Bookings
            </Link>
          </p>
          <h1 className="text-2xl font-bold">Audit engagement</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Client: {clientName} · Auditor: {auditorName}
          </p>
        </div>
        <Badge>{booking.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          {booking.scheduled_start && <p>Start: {new Date(booking.scheduled_start).toLocaleString()}</p>}
          {booking.scheduled_end && <p>End: {new Date(booking.scheduled_end).toLocaleString()}</p>}
          {booking.site_address && <p>{booking.site_address}</p>}
          {booking.scope_summary && <p>{booking.scope_summary}</p>}
          {booking.site_notes && <p>Notes: {booking.site_notes}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {isAuditor && booking.status === "requested" && (
            <>
              <Button size="sm" onClick={() => void doAction("confirm")}>
                Confirm
              </Button>
              <Button size="sm" variant="destructive" onClick={() => void doAction("decline")}>
                Decline
              </Button>
            </>
          )}
          {isAuditor && booking.status === "confirmed" && (
            <Button size="sm" onClick={() => void doAction("start")}>
              Start audit
            </Button>
          )}
          {isAuditor && booking.status === "in_progress" && (
            <Button size="sm" onClick={() => void doAction("complete")}>
              Mark complete
            </Button>
          )}
          {(isClient || isAuditor) &&
            ["requested", "confirmed"].includes(booking.status) && (
              <Button size="sm" variant="outline" onClick={() => void doAction("cancel")}>
                Cancel
              </Button>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Digital checklist</CardTitle>
          <span className="text-xs text-muted-foreground">{items.filter((i) => i.is_completed).length} / {items.length}</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={item.is_completed}
                  onCheckedChange={(v) => void toggleItem(item, v === true)}
                  disabled={!uid || (!isClient && !isAuditor)}
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={item.id} className="font-medium cursor-pointer">
                    {item.title}
                  </label>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
              </div>
              <Textarea
                placeholder="Notes for this step…"
                defaultValue={item.notes || ""}
                className="text-sm min-h-[60px]"
                disabled={!isClient && !isAuditor}
                onBlur={(e) => {
                  if (e.target.value !== (item.notes || "")) {
                    void saveItemNotes(item.id, e.target.value);
                  }
                }}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="file"
                  className="text-xs max-w-[220px]"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f, item.id);
                    e.target.value = "";
                  }}
                />
                <span className="text-xs text-muted-foreground">Attach evidence to this item</span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">General evidence (no checklist row)</p>
            <Input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFile(f, null);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {evidence.map((ev) => (
                <li key={ev.id} className="flex justify-between gap-2">
                  <button
                    type="button"
                    className="text-primary hover:underline truncate text-left"
                    onClick={() => void openEvidence(ev.file_path)}
                  >
                    {ev.file_name}
                  </button>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(ev.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {isClient && booking.status === "completed" && !reviewDone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate this engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Rating (1–5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-24 mt-1"
              />
            </div>
            <div>
              <Label>Comment</Label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <Button onClick={() => void submitReview()}>Submit review</Button>
          </CardContent>
        </Card>
      )}

      {reviewDone && isClient && (
        <p className="text-sm text-muted-foreground">You have submitted a review for this booking.</p>
      )}
    </div>
  );
}
