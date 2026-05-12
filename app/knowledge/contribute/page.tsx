"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  ACCEPT_ATTRIBUTE,
  ALLOWED_MIME_TYPES,
  CATEGORIES,
  INDUSTRIES,
  MAX_FILE_SIZE,
  formatFileSize,
  formatSupabaseError,
  getFileIcon,
  isKnowledgeResourcesSchemaMissing,
  knowledgeStorageUploadHint,
} from "@/lib/knowledge-utils";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, BookOpen, CheckCircle2, Loader2, Sparkles, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

interface QueuedFile {
  id: string;
  file: File;
  status: "queued" | "uploading" | "uploaded" | "failed";
  progress: number;
  error?: string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildKnowledgeObjectPath(userId: string, file: File): string {
  const raw = file.name.includes(".") ? file.name.split(".").pop() || "" : "";
  const ext = raw.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 12) || "bin";
  const id =
    typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : makeId();
  return `${userId}/${id}.${ext}`;
}

const SCHEMA_SETUP_MESSAGE =
  "Open Supabase (SafetyShaper) → SQL Editor → run the full script in lib/knowledge-resources-schema.sql (table + storage bucket + policies).";

export default function ContributeResourcePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [categoryAiLoading, setCategoryAiLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    industry: "",
    tags: "",
    externalUrl: "",
    expiresAt: "",
  });

  const suggestCategory = useCallback(async () => {
    if (!session?.user) return;
    const fileNames = queue.map((q) => q.file.name);
    if (!formData.title.trim() && !formData.description.trim() && fileNames.length === 0) {
      toast({
        title: "Add context",
        description: "Enter a title or description, or add files, then try AI suggest.",
        variant: "destructive",
      });
      return;
    }
    setCategoryAiLoading(true);
    try {
      const res = await fetch("/api/ai/categorize-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title.trim() || undefined,
          description: formData.description.trim() || undefined,
          fileNames: fileNames.length ? fileNames : undefined,
        }),
      });
      const data = (await res.json()) as {
        result?: { primary_category: string; rationale?: string };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Categorization failed");
      const cat = data.result?.primary_category;
      if (cat) {
        setFormData((p) => ({ ...p, category: cat }));
        toast({
          title: "Category suggested",
          description:
            data.result?.rationale?.slice(0, 180) || "Review and adjust before submitting.",
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Suggest failed";
      toast({ title: "AI suggest", description: msg, variant: "destructive" });
    } finally {
      setCategoryAiLoading(false);
    }
  }, [session?.user, formData.title, formData.description, queue, toast]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files);
      const accepted: QueuedFile[] = [];
      const rejected: string[] = [];

      for (const file of incoming) {
        if (file.size > MAX_FILE_SIZE) {
          rejected.push(`${file.name} exceeds 100 MB`);
          continue;
        }
        if (ALLOWED_MIME_TYPES.length > 0 && file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
          rejected.push(`${file.name} is an unsupported type`);
          continue;
        }
        accepted.push({
          id: makeId(),
          file,
          status: "queued",
          progress: 0,
        });
      }

      if (rejected.length > 0) {
        toast({
          title: "Some files were skipped",
          description: rejected.join(", "),
          variant: "destructive",
        });
      }

      if (accepted.length > 0) {
        setQueue((prev) => [...prev, ...accepted]);
      }
    },
    [toast]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQueueItem = (id: string, patch: Partial<QueuedFile>) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const uploadToBucket = async (bucket: string, objectPath: string, file: File) => {
    const base = { cacheControl: "3600", upsert: false as const };
    let result = await supabase.storage.from(bucket).upload(objectPath, file, {
      ...base,
      contentType: file.type || undefined,
    });
    // Some buckets reject a client-supplied Content-Type; retry without it.
    if (result.error && file.type) {
      result = await supabase.storage.from(bucket).upload(objectPath, file, base);
    }
    return result;
  };

  const uploadSingle = async (
    item: QueuedFile,
    userId: string
  ): Promise<{ url: string | null; error: string | null }> => {
    const path = buildKnowledgeObjectPath(userId, item.file);

    const primary = await uploadToBucket("knowledge-resources", path, item.file);

    if (!primary.error) {
      const { data } = supabase.storage.from("knowledge-resources").getPublicUrl(path);
      return { url: data.publicUrl, error: null };
    }

    // Fallback to existing post-documents bucket if dedicated bucket isn't ready.
    const fallback = await uploadToBucket("post-documents", `knowledge/${path}`, item.file);

    if (fallback.error) {
      const primaryMsg = formatSupabaseError(primary.error);
      const storageHint = knowledgeStorageUploadHint(primaryMsg);
      const hint =
        primary.error?.message?.includes("Bucket not found") ||
        primary.error?.message?.toLowerCase().includes("not found")
          ? ' Create bucket "knowledge-resources" or run lib/knowledge-resources-schema.sql.'
          : "";
      return {
        url: null,
        error: `${primaryMsg}${hint ? ` ${hint}` : ""}${storageHint ? ` ${storageHint}` : ""} Fallback: ${formatSupabaseError(fallback.error)}`,
      };
    }

    const { data } = supabase.storage.from("post-documents").getPublicUrl(`knowledge/${path}`);
    return { url: data.publicUrl, error: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contribute a resource.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    const hasFiles = queue.length > 0;
    const hasExternal = formData.externalUrl.trim().length > 0;

    if (!formData.title.trim() && !hasFiles) {
      toast({
        title: "Title required",
        description:
          "Please give your resource a title, or upload at least one file (we'll use the file name).",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a category for the resource(s).",
        variant: "destructive",
      });
      return;
    }

    if (!hasFiles && !hasExternal) {
      toast({
        title: "File or link required",
        description: "Upload at least one file or provide an external link.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const userId = session.user.id;
    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const tagsValue = tagsArray.length > 0 ? tagsArray : null;
    const expiresAt = formData.expiresAt || null;
    const description = formData.description.trim() || null;
    const industry = formData.industry || null;
    const externalUrl = formData.externalUrl.trim() || null;
    const baseTitle = formData.title.trim();

    let successCount = 0;
    let firstError: string | null = null;
    let missingTable = false;

    try {
      if (hasFiles) {
        for (const item of queue) {
          if (item.status === "uploaded") {
            successCount++;
            continue;
          }
          updateQueueItem(item.id, { status: "uploading", progress: 25 });

          const { url, error } = await uploadSingle(item, userId);
          if (error || !url) {
            updateQueueItem(item.id, {
              status: "failed",
              progress: 0,
              error: error || "Upload failed",
            });
            if (!firstError) firstError = error || "Upload failed";
            continue;
          }
          updateQueueItem(item.id, { progress: 75 });

          const fileTitle =
            queue.length === 1 && baseTitle
              ? baseTitle
              : baseTitle
                ? `${baseTitle} — ${item.file.name}`
                : item.file.name.replace(/\.[^/.]+$/, "");

          const { error: insertError } = await supabase.from("knowledge_resources").insert([
            {
              title: fileTitle,
              description,
              category: formData.category,
              industry,
              tags: tagsValue,
              file_url: url,
              file_name: item.file.name,
              file_size: item.file.size,
              file_type: item.file.type || null,
              external_url: queue.length === 1 && externalUrl ? externalUrl : null,
              expires_at: expiresAt,
              contributed_by: userId,
            },
          ]);

          if (insertError) {
            if (isKnowledgeResourcesSchemaMissing(insertError)) {
              missingTable = true;
              updateQueueItem(item.id, {
                status: "failed",
                progress: 0,
                error: SCHEMA_SETUP_MESSAGE,
              });
              if (!firstError) firstError = formatSupabaseError(insertError);
              continue;
            }
            updateQueueItem(item.id, {
              status: "failed",
              progress: 0,
              error: formatSupabaseError(insertError),
            });
            if (!firstError) firstError = formatSupabaseError(insertError);
            continue;
          }

          updateQueueItem(item.id, { status: "uploaded", progress: 100 });
          successCount++;
        }
      } else if (hasExternal) {
        const { error: insertError } = await supabase.from("knowledge_resources").insert([
          {
            title: baseTitle || externalUrl,
            description,
            category: formData.category,
            industry,
            tags: tagsValue,
            file_url: null,
            file_name: null,
            file_size: null,
            file_type: null,
            external_url: externalUrl,
            expires_at: expiresAt,
            contributed_by: userId,
          },
        ]);

        if (insertError) {
          if (isKnowledgeResourcesSchemaMissing(insertError)) {
            missingTable = true;
          } else {
            throw insertError;
          }
        } else {
          successCount++;
        }
      }

      if (missingTable) {
        toast({
          title: "Database not set up",
          description: SCHEMA_SETUP_MESSAGE,
          variant: "destructive",
        });
      } else if (successCount > 0 && !firstError) {
        toast({
          title: "Thanks for contributing!",
          description:
            successCount === 1
              ? "Your resource has been published."
              : `${successCount} resources have been published.`,
        });
      } else if (successCount > 0 && firstError) {
        toast({
          title: "Partial success",
          description: `${successCount} uploaded, but some failed: ${firstError}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission failed",
          description: firstError || "No files were uploaded.",
          variant: "destructive",
        });
      }

      if (successCount > 0 && !missingTable) {
        router.push("/knowledge");
      }
    } catch (error: unknown) {
      console.error("Contribute resource error:", formatSupabaseError(error));
      toast({
        title: "Submission failed",
        description: formatSupabaseError(error) || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const allUploaded = queue.length > 0 && queue.every((q) => q.status === "uploaded");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link
            href="/knowledge"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Knowledge Center
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Contribute Resources
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Share EHS, ESG, fire safety, compliance, audit, training or environmental resources
              with the community. Drag and drop multiple files at once.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Files</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileInput}
                  accept={ACCEPT_ATTRIBUTE}
                />
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-gray-300 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {isDragging
                      ? "Drop files to add to the queue"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Word, Excel, PowerPoint, images, video, ZIP — up to 100 MB each. Bulk
                    upload supported.
                  </p>
                </div>

                {queue.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {queue.map((item) => {
                      const Icon = getFileIcon(item.file.type, item.file.name);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            item.status === "failed"
                              ? "bg-red-50 border-red-200"
                              : item.status === "uploaded"
                                ? "bg-green-50 border-green-200"
                                : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{item.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(item.file.size)}
                                {item.status === "uploading" && " • Uploading..."}
                                {item.status === "failed" && ` • ${item.error || "Failed"}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {item.status === "uploaded" && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                            {item.status !== "uploading" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromQueue(item.id)}
                                aria-label={`Remove ${item.file.name}`}
                                disabled={loading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            {item.status === "uploading" && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Title{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    {queue.length > 1 ? "(optional — file names will be used)" : ""}
                  </span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. ISO 45001 Implementation Checklist"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe the resource(s) and how they can help others..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={categoryAiLoading || loading}
                      onClick={() => void suggestCategory()}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      {categoryAiLoading ? "Suggesting…" : "AI suggest"}
                    </Button>
                  </div>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((p) => ({ ...p, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Industry / Sector</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData((p) => ({ ...p, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i.value} value={i.value}>
                          {i.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="ISO 45001, HIRA, JSA"
                    value={formData.tags}
                    onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma separated. Helps with discovery & search.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Document Expiry (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.expiresAt}
                    onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    For certificates / licenses. Users get an expiring-soon badge.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalUrl">External Link (optional)</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  placeholder="https://example.com/resource"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, externalUrl: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Use this if the resource lives on an external site. Only saved on the first item
                  when uploading multiple files.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/knowledge")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || allUploaded}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {queue.length > 1 ? "Uploading..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {queue.length > 1 ? `Publish ${queue.length} resources` : "Submit Resource"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
