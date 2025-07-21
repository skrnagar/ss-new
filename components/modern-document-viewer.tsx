import { useState } from "react";

interface Props {
  url: string;
  type: "pdf" | "docx";
  fileName?: string;
}

export default function ModernDocumentViewer({ url, type }: Props) {
  // Unified full-width document preview for both PDF and DOCX
  const isDocx = type === "docx";
  const iframeSrc = isDocx
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    : `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden">
      <iframe
        src={iframeSrc}
        className="w-full h-full"
        style={{ border: 0, padding: 0, margin: 0, display: 'block' }}
        title={isDocx ? "DOCX Preview" : "PDF Preview"}
        allowFullScreen
      />
    </div>
  );
} 