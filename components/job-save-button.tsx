"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface JobSaveButtonProps {
  jobId: string;
  userId: string;
}

export function JobSaveButton({ jobId, userId }: JobSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [jobId, userId]);

  const checkIfSaved = async () => {
    const { data } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .single();

    setIsSaved(!!data);
  };

  const handleToggleSave = async () => {
    setLoading(true);

    try {
      if (isSaved) {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", userId);

        setIsSaved(false);
      } else {
        await supabase
          .from("saved_jobs")
          .insert({ job_id: jobId, user_id: userId });

        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleSave}
      disabled={loading}
      className="gap-2"
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save
        </>
      )}
    </Button>
  );
}

