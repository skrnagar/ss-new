import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { getChatModel } from "@/lib/ai/openai";
import { resumeParseSchema } from "@/lib/ai/schemas";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text =
    typeof (body as { text?: string }).text === "string"
      ? (body as { text: string }).text.trim()
      : "";
  if (text.length < 80) {
    return NextResponse.json(
      { error: "Provide at least 80 characters of resume text for reliable parsing." },
      { status: 400 }
    );
  }
  if (text.length > 18_000) {
    return NextResponse.json({ error: "Resume text is too long." }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model,
      output: Output.object({
        schema: resumeParseSchema,
        name: "resume_profile",
        description: "Structured CV fields for an EHS/ESG professional profile",
      }),
      system: `You extract structured data from CV/resume text for a workplace safety and sustainability networking app.
Use only information grounded in the text. Infer EHS, ESG, quality, and operations skills when clearly supported.
If something is missing, use empty arrays or null — do not invent employers, degrees, or credentials.`,
      prompt: `Resume text:\n---\n${text}\n---`,
      maxOutputTokens: 2048,
      temperature: 0.2,
    });

    return NextResponse.json({
      parsed: {
        ...output,
        parsed_at: new Date().toISOString(),
        source: "openai",
      },
    });
  } catch (e: unknown) {
    console.error("[ai/parse-resume]", e);
    const msg = e instanceof Error ? e.message : "Parse failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
