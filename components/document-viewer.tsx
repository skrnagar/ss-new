"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, FileText } from "lucide-react";
import { InlineLoader } from "@/components/ui/logo-loder";
import { GlobalWorkerOptions, getDocument, version } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import mammoth from "mammoth";

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  url: string;
  type: "pdf" | "docx";
  filename?: string;
}

export function DocumentViewer({ url, type, filename }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const [pdf, setPdf] = useState<any>(null);
  const [docxHtml, setDocxHtml] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);

  // PDF rendering
  useEffect(() => {
    if (type !== "pdf") return;
    setLoading(true);
    setError(null);
    getDocument(url).promise
      .then((pdfDoc: any) => {
        setPdf(pdfDoc);
        setPageCount(pdfDoc.numPages);
        setPageNum(1);
        setLoading(false);
      })
      .catch((err: any) => {
        setError("Failed to load PDF");
        setLoading(false);
      });
  }, [url, type]);

  useEffect(() => {
    if (type !== "pdf" || !pdf || !canvasRef.current) return;
    setLoading(true);
    pdf.getPage(pageNum).then((page: any) => {
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: context, viewport }).promise.then(() => {
        setLoading(false);
      });
    });
  }, [pdf, pageNum, zoom, type]);

  // DOCX rendering
  useEffect(() => {
    if (type !== "docx") return;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) =>
        mammoth.convertToHtml({ arrayBuffer }).then((result) => {
          setDocxHtml(result.value);
          setLoading(false);
        })
      )
      .catch((err) => {
        setError("Failed to load DOCX");
        setLoading(false);
      });
  }, [url, type]);

  const handleDownload = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="w-full bg-white rounded-md border p-4 flex flex-col items-center max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="truncate max-w-[200px]">{filename || url.split("/").pop()}</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
              {loading && (
          <div className="flex flex-col items-center justify-center h-64 w-full">
            <InlineLoader size="md" variant="fade" />
            <span className="text-muted-foreground mt-2">Loading document...</span>
          </div>
        )}
      {error && (
        <div className="text-red-500 text-center py-8">{error}</div>
      )}
      {/* PDF Viewer */}
      {type === "pdf" && !loading && !error && (
        <div className="w-full flex flex-col items-center">
          <div className="relative w-full flex justify-center">
            <canvas ref={canvasRef} className="rounded-md border bg-white max-w-full" />
            {/* Navigation arrows on hover */}
            {pageCount > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-primary/20"
                  onClick={() => setPageNum((n) => Math.max(1, n - 1))}
                  disabled={pageNum === 1}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-primary/20"
                  onClick={() => setPageNum((n) => Math.min(pageCount, n + 1))}
                  disabled={pageNum === pageCount}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-xs text-muted-foreground">
              Page {pageNum} / {pageCount}
            </span>
            <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}>
              -
            </Button>
            <span className="text-xs">{Math.round(zoom * 100)}%</span>
            <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.min(2, z + 0.2))}>
              +
            </Button>
            <Button size="sm" variant="outline" onClick={() => setZoom(1)}>
              Fit
            </Button>
          </div>
        </div>
      )}
      {/* DOCX Viewer */}
      {type === "docx" && !loading && !error && (
        <div className="w-full max-h-[60vh] overflow-auto border rounded-md bg-white p-4 prose prose-sm" dangerouslySetInnerHTML={{ __html: docxHtml }} />
      )}
    </div>
  );
} 