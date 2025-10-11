"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Send } from "lucide-react";

interface JobApplyButtonProps {
  jobId: string;
  userId: string;
  hasApplied?: boolean;
}

export function JobApplyButton({ jobId, userId, hasApplied: initialHasApplied }: JobApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(initialHasApplied || false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const { toast } = useToast();

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast({
        title: "Cover letter required",
        description: "Please write a cover letter",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("job_applications")
        .insert({
          job_id: jobId,
          user_id: userId,
          cover_letter: coverLetter,
          resume_url: resumeUrl || null,
          status: "pending",
        });

      if (error) throw error;

      setHasApplied(true);
      setIsOpen(false);

      toast({
        title: "Application submitted!",
        description: "Your application has been sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (hasApplied) {
    return (
      <Button disabled className="flex-1 gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Applied
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex-1 gap-2">
        <Send className="h-4 w-4" />
        Apply Now
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for this Position</DialogTitle>
            <DialogDescription>
              Submit your application with a cover letter explaining why you're a great fit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                rows={8}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
              <Input
                id="resumeUrl"
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="Link to your resume or portfolio"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide a link to your online resume, LinkedIn profile, or portfolio
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={loading || !coverLetter.trim()}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

