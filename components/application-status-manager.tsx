"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Edit, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplicationStatusManagerProps {
  applicationId: string;
  currentStatus: string;
  currentNotes: string;
}

export function ApplicationStatusManager({
  applicationId,
  currentStatus,
  currentNotes,
}: ApplicationStatusManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);

    try {
      const updateData: any = {
        status,
        notes: notes.trim() || null,
      };

      // Add reviewed_at timestamp if changing from pending
      if (currentStatus === "pending" && status !== "pending") {
        updateData.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("job_applications")
        .update(updateData)
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Application updated",
        description: "Status and notes have been saved",
      });

      setIsOpen(false);
      router.refresh(); // Refresh the page to show updated data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={currentStatus === "pending" ? "default" : "outline"}
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Edit className="h-4 w-4" />
        {currentStatus === "pending" ? "Review" : "Update Status"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the application status and add internal notes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status">Application Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes about this candidate..."
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                These notes are private and only visible to hiring managers
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

