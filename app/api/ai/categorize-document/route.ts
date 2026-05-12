import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, Output } from "ai";
import { getChatModel } from "@/lib/ai/openai";
import { categorizeDocumentSchema } from "@/lib/ai/schemas";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

const bodySchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().max(8000).optional(),
  fileNames: z.array(z.string().max(260)).max(20).optional(),
});

export async function POST(req: Request) {
  const model = getChatModel();
  if (!model) {
    return NextResponse.json(
      { error: "AI is not configured. Set OPENAI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, description, fileNames } = parsed.data;
  const blob = [
    title && `Title: ${title}`,
    description && `Description: ${description}`,
    fileNames?.length && `File names: ${fileNames.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (blob.length < 10) {
    return NextResponse.json(
      { error: "Provide a title, description, and/or file names to categorize." },
      { status: 400 }
    );
  }

  try {
    const { output } = await generateText({
      model,
      output: Output.object({
        schema: categorizeDocumentSchema,
        name: "knowledge_resource_category",
        description: "Primary taxonomy category for a safety/ESG knowledge resource",
      }),
      system: `You classify uploaded professional resources for a workplace safety and ESG knowledge hub.
Choose exactly one primary_category from the allowed enum values (snake-case).
secondary_tags are short kebab-case or single-word tags (max 8).`,
      prompt: `Classify this contribution:\n${blob}`,
      maxOutputTokens: 512,
      temperature: 0.15,
    });

    return NextResponse.json({ result: output });
  } catch (e: unknown) {
    console.error("[ai/categorize-document]", e);
    const msg = e instanceof Error ? e.message : "Categorization failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
