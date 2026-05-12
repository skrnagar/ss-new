"use client";

import mammoth from "mammoth";

const MAX_CHARS = 14_000;

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF text extraction runs in the browser only.");
  }

  const { getDocument, GlobalWorkerOptions, version } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const line = textContent.items
      .map((item) => {
        if (item && typeof item === "object" && "str" in item && typeof item.str === "string") {
          return item.str;
        }
        return "";
      })
      .join(" ");
    parts.push(line);
  }
  return parts.join("\n");
}

/** Extract plain text from a CV file in the browser (PDF / DOCX). Truncates for LLM limits. */
export async function extractCvTextFromFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const raw = await extractPdfText(buf);
    return raw.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  }

  if (
    file.type.includes("wordprocessing") ||
    file.type === "application/msword" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    return value.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  }

  throw new Error("Unsupported file type for text extraction");
}
