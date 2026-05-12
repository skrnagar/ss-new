"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatFileSize,
  getFileTypeGroup,
  getFileTypeLabel,
  labelForCategory,
  labelForIndustry,
  type KnowledgeResource,
} from "@/lib/knowledge-utils";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useMemo } from "react";

interface ResourcePreviewModalProps {
  resource: KnowledgeResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (resource: KnowledgeResource) => void;
}

export function ResourcePreviewModal({
  resource,
  open,
  onOpenChange,
  onDownload,
}: ResourcePreviewModalProps) {
  const fileGroup = useMemo(
    () =>
      resource ? getFileTypeGroup(resource.file_type, resource.file_name) : null,
    [resource]
  );

  if (!resource) return null;

  const renderPreview = () => {
    if (!resource.file_url) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3" />
          <p className="text-sm">No file attached for preview.</p>
          {resource.external_url && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.open(resource.external_url!, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open external link
            </Button>
          )}
        </div>
      );
    }

    switch (fileGroup) {
      case "pdf":
        return (
          <iframe
            src={`${resource.file_url}#toolbar=1&view=FitH`}
            className="w-full h-[70vh] rounded-md border bg-muted"
            title={resource.title}
          />
        );
      case "image":
        return (
          <div className="flex items-center justify-center bg-muted rounded-md">
            <img
              src={resource.file_url}
              alt={resource.title}
              className="max-h-[70vh] max-w-full object-contain rounded-md"
            />
          </div>
        );
      case "video":
        return (
          <video
            src={resource.file_url}
            controls
            className="w-full max-h-[70vh] rounded-md bg-black"
          >
            <track kind="captions" />
          </video>
        );
      case "word":
      case "excel":
      case "powerpoint":
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              resource.file_url
            )}`}
            className="w-full h-[70vh] rounded-md border bg-muted"
            title={resource.title}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground border-2 border-dashed rounded-md">
            <FileText className="h-12 w-12 mb-3" />
            <p className="text-sm">
              Preview isn&apos;t available for this file type. Download to view.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden max-h-[95vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl pr-8">{resource.title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="secondary">
              {labelForCategory(resource.category)}
            </Badge>
            {resource.industry && (
              <Badge variant="outline">
                {labelForIndustry(resource.industry)}
              </Badge>
            )}
            <span>•</span>
            <span>
              {getFileTypeLabel(resource.file_type, resource.file_name)}
            </span>
            {resource.file_size != null && (
              <>
                <span>•</span>
                <span>{formatFileSize(resource.file_size)}</span>
              </>
            )}
            {(resource.download_count ?? 0) > 0 && (
              <>
                <span>•</span>
                <span>
                  {resource.download_count}{" "}
                  {resource.download_count === 1 ? "download" : "downloads"}
                </span>
              </>
            )}
          </div>
          {resource.description && (
            <p className="text-sm text-muted-foreground mt-3">
              {resource.description}
            </p>
          )}
        </DialogHeader>

        <div className="p-6 overflow-auto flex-1">{renderPreview()}</div>

        <div className="border-t p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/30">
          <div className="flex flex-wrap gap-1">
            {resource.tags?.slice(0, 6).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            {resource.external_url && (
              <Button
                variant="outline"
                onClick={() => window.open(resource.external_url!, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </Button>
            )}
            {resource.file_url && (
              <Button onClick={() => onDownload?.(resource)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
