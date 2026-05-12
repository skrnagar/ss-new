import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  type LucideIcon,
} from "lucide-react";

export interface KnowledgeResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  industry: string | null;
  tags: string[] | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  external_url: string | null;
  expires_at: string | null;
  download_count: number | null;
  status: "pending" | "approved" | "rejected";
  contributed_by: string | null;
  created_at: string;
  updated_at: string;
  contributor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const CATEGORIES = [
  { value: "risk-assessment", label: "Risk Assessments" },
  { value: "safety-plan", label: "Safety Plans" },
  { value: "compliance", label: "Compliance Documents" },
  { value: "audit", label: "Audit" },
  { value: "fire-safety", label: "Fire Safety" },
  { value: "environment", label: "Environment / ESG" },
  { value: "template", label: "Templates" },
  { value: "infographic", label: "Infographics" },
  { value: "guide", label: "Guides & Whitepapers" },
  { value: "training", label: "Training Material" },
  { value: "other", label: "Other" },
];

export const INDUSTRIES = [
  { value: "construction", label: "Construction" },
  { value: "pharma", label: "Pharma" },
  { value: "chemical", label: "Chemical" },
  { value: "automobile", label: "Automobile" },
  { value: "renewable-energy", label: "Renewable Energy" },
  { value: "fmcg", label: "FMCG" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "oil-gas", label: "Oil & Gas" },
  { value: "energy", label: "Energy" },
  { value: "mining", label: "Mining" },
  { value: "healthcare", label: "Healthcare" },
  { value: "transportation", label: "Transportation" },
  { value: "general", label: "General / All Industries" },
];

export const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "word", label: "Word" },
  { value: "excel", label: "Excel" },
  { value: "powerpoint", label: "PowerPoint" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "archive", label: "ZIP / Archive" },
];

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "application/zip",
  "application/x-zip-compressed",
];

export const ACCEPT_ATTRIBUTE =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.webm,.avi,.zip";

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB to accommodate video

export type FileTypeGroup =
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "image"
  | "video"
  | "archive"
  | "other";

export function getFileTypeGroup(
  mime: string | null | undefined,
  fileName?: string | null
): FileTypeGroup {
  const m = (mime || "").toLowerCase();
  const ext = (fileName || "").toLowerCase().split(".").pop() || "";

  if (m === "application/pdf" || ext === "pdf") return "pdf";
  if (m.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext))
    return "image";
  if (m.startsWith("video/") || ["mp4", "mov", "webm", "avi", "mkv"].includes(ext))
    return "video";
  if (
    m.includes("word") ||
    m.includes("msword") ||
    ["doc", "docx"].includes(ext)
  )
    return "word";
  if (
    m.includes("excel") ||
    m.includes("spreadsheet") ||
    ["xls", "xlsx", "csv"].includes(ext)
  )
    return "excel";
  if (
    m.includes("powerpoint") ||
    m.includes("presentation") ||
    ["ppt", "pptx"].includes(ext)
  )
    return "powerpoint";
  if (m.includes("zip") || ["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return "archive";
  return "other";
}

export function getFileIcon(
  mime: string | null | undefined,
  fileName?: string | null
): LucideIcon {
  switch (getFileTypeGroup(mime, fileName)) {
    case "pdf":
      return FileText;
    case "word":
      return FileText;
    case "excel":
      return FileSpreadsheet;
    case "powerpoint":
      return Presentation;
    case "image":
      return FileImage;
    case "video":
      return FileVideo;
    case "archive":
      return FileArchive;
    default:
      return FileText;
  }
}

export function getFileTypeLabel(
  mime: string | null | undefined,
  fileName?: string | null
): string {
  const group = getFileTypeGroup(mime, fileName);
  return (
    FILE_TYPES.find((f) => f.value === group)?.label ||
    (fileName?.split(".").pop()?.toUpperCase() ?? "FILE")
  );
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const intervals: Array<[number, string]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let value = seconds;
  let unit = "second";
  for (const [divisor, label] of intervals) {
    if (value < divisor) {
      unit = label;
      break;
    }
    value = Math.floor(value / divisor);
    unit = label;
  }
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

export type ExpiryState =
  | { kind: "none" }
  | { kind: "expired"; daysAgo: number }
  | { kind: "expiring-soon"; daysLeft: number }
  | { kind: "ok"; daysLeft: number };

export function getExpiryState(
  expiresAt: string | null | undefined
): ExpiryState {
  if (!expiresAt) return { kind: "none" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiresAt);
  exp.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) return { kind: "expired", daysAgo: -diffDays };
  if (diffDays <= 30) return { kind: "expiring-soon", daysLeft: diffDays };
  return { kind: "ok", daysLeft: diffDays };
}

export function labelForCategory(value: string | null | undefined): string {
  if (!value) return "Uncategorized";
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

export function labelForIndustry(value: string | null | undefined): string {
  if (!value) return "";
  return INDUSTRIES.find((i) => i.value === value)?.label || value;
}

/** Readable message for Supabase / PostgREST / Storage errors (avoids empty `{}` in console). */
export function formatSupabaseError(err: unknown): string {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || String(err);

  const o = err as Record<string, unknown>;
  const parts = [o.message, o.error_description, o.details, o.hint, o.code]
    .filter((x) => typeof x === "string" && (x as string).length > 0) as string[];
  return parts.length > 0 ? parts.join(" — ") : JSON.stringify(err);
}

/** Hint when Storage upload returns 4xx (RLS, MIME, bucket, or path). */
export function knowledgeStorageUploadHint(message: string | undefined | null): string {
  const m = (message || "").toLowerCase();
  if (m.includes("row-level security") || m.includes("rls") || m.includes("policy")) {
    return "Storage rejected the upload (RLS). In Supabase run lib/knowledge-resources-schema.sql section 4 (bucket + policies), or fix storage.objects policies for bucket knowledge-resources.";
  }
  if (m.includes("mime") || m.includes("mimetype") || m.includes("not allowed")) {
    return 'Bucket may restrict file types. In SQL Editor: UPDATE storage.buckets SET allowed_mime_types = NULL WHERE id = \'knowledge-resources\';';
  }
  if (m.includes("duplicate") || m.includes("already exists")) {
    return "Object path collision — try again (a new random name is used on each attempt).";
  }
  if (m.includes("payload too large") || m.includes("size")) {
    return "File exceeds the bucket file_size_limit (schema sets 100 MB).";
  }
  return "Confirm bucket knowledge-resources exists and section 4 of lib/knowledge-resources-schema.sql was applied.";
}

/** Dashboard → SQL → new query (uses project ref from NEXT_PUBLIC_SUPABASE_URL). */
export function getSupabaseSqlEditorUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    const m = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    if (!m?.[1]) return null;
    return `https://supabase.com/dashboard/project/${m[1]}/sql/new`;
  } catch {
    return null;
  }
}

/** True when `knowledge_resources` is missing or PostgREST cannot see it yet. */
export function isKnowledgeResourcesSchemaMissing(err: unknown): boolean {
  const o = err as { code?: string; message?: string; status?: number | string };
  const msg = (o?.message || "").toLowerCase();
  const code = o?.code != null ? String(o.code) : "";
  const status = o?.status != null ? Number(o.status) : NaN;

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    (!Number.isNaN(status) && status === 404) ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache") ||
    (msg.includes("relation") && msg.includes("knowledge_resources"))
  );
}
