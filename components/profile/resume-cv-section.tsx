"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { extractCvTextFromFile } from "@/lib/extract-cv-text";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";

function stubParse(note: string) {
  return {
    _stub: true,
    note,
    suggested_skills: [] as string[],
    suggested_headline: null as string | null,
    parsed_at: new Date().toISOString(),
  };
}

export function ResumeCvSection({
  userId,
  isOwnProfile,
  cvUrl,
  cvVisibility,
  resumeParsed,
}: {
  userId: string;
  isOwnProfile: boolean;
  cvUrl: string | null;
  cvVisibility: string | null;
  resumeParsed: unknown;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [visibility, setVisibility] = useState(cvVisibility || "private");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;
    const ok =
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type.includes("wordprocessing") ||
      file.name.endsWith(".docx");
    if (!ok) {
      toast({
        title: "Invalid file",
        description: "Upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let extracted = "";
      try {
        extracted = await extractCvTextFromFile(file);
      } catch {
        extracted = "";
      }

      const path = `resumes/${userId}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("post-documents")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-documents").getPublicUrl(path);

      let resumeParsed: Record<string, unknown> = stubParse(
        extracted.length < 80
          ? "Could not extract enough text (try PDF or DOCX). CV URL saved."
          : "AI parse skipped or failed — CV URL saved."
      );

      if (extracted.length >= 80) {
        const parseRes = await fetch("/api/ai/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: extracted }),
        });
        if (parseRes.ok) {
          const data = (await parseRes.json()) as { parsed?: Record<string, unknown> };
          if (data.parsed) resumeParsed = data.parsed;
        } else {
          const err = (await parseRes.json().catch(() => ({}))) as { error?: string };
          resumeParsed = stubParse(err.error || `AI parse failed (${parseRes.status})`);
        }
      }

      const years = resumeParsed.years_experience_estimate;
      const yearsNum = typeof years === "number" ? years : null;

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({
          cv_url: publicUrl,
          resume_parsed_json: resumeParsed,
          ...(yearsNum != null ? { years_experience: yearsNum } : {}),
        })
        .eq("id", userId);

      if (dbErr) throw dbErr;

      toast({
        title: "CV uploaded",
        description:
          resumeParsed.source === "openai"
            ? "Resume parsed with AI — review fields below."
            : "Saved. AI parsing may be unavailable — check parsed preview.",
      });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const saveVisibility = async (v: string) => {
    setVisibility(v);
    if (!isOwnProfile) return;
    await supabase.from("profiles").update({ cv_visibility: v }).eq("id", userId);
    router.refresh();
  };

  const parsed = resumeParsed as Record<string, unknown> | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          CV / Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwnProfile && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword"
              className="hidden"
              onChange={onFile}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading…" : "Upload CV (PDF / Word)"}
            </Button>
            <div className="space-y-2">
              <Label>Who can download your CV</Label>
              <Select value={visibility} onValueChange={saveVisibility}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Only me</SelectItem>
                  <SelectItem value="public">Anyone with profile link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {cvUrl && (isOwnProfile || visibility === "public") && (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary font-medium"
          >
            Download CV
          </a>
        )}

        {!isOwnProfile && cvUrl && visibility !== "public" && (
          <p className="text-sm text-muted-foreground">This member has not made their CV public.</p>
        )}

        {parsed && (isOwnProfile || visibility === "public") && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium mb-2">
              Parsed preview
              {parsed.source === "openai" ? (
                <span className="text-xs font-normal text-muted-foreground ml-2">(AI)</span>
              ) : null}
            </p>
            <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
