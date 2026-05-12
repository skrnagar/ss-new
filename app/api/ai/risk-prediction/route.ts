import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, Output } from "ai";
import { getChatModel } from "@/lib/ai/openai";
import { riskPredictionSchema } from "@/lib/ai/schemas";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

const bodySchema = z.object({
  title: z.string().min(3).max(500),
  category: z.string().max(200).optional(),
  currentSeverity: z.enum(["low", "medium", "high", "critical"]).optional(),
  context: z.string().max(4000).optional(),
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

  const { title, category, currentSeverity, context } = parsed.data;
  const prompt = [
    `Incident / event title: ${title}`,
    category && `Category hint: ${category}`,
    currentSeverity && `Reporter-selected severity: ${currentSeverity}`,
    context && `Additional context:\n${context}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { output } = await generateText({
      model,
      output: Output.object({
        schema: riskPredictionSchema,
        name: "incident_risk_hint",
        description:
          "Heuristic risk triage hint for a reported safety incident — not a replacement for investigation",
      }),
      system: `You help safety practitioners prioritize incident reports by producing a qualitative risk triage hint.
Use general industry heuristics only. The predicted_risk_band is an opinionated snapshot — not a formal risk assessment.
Always include a disclaimer that human review, local criteria, and regulatory obligations determine real risk.
Do not claim certainty. If information is sparse, prefer "medium" band and say so in contributing_factors.`,
      prompt,
      maxOutputTokens: 800,
      temperature: 0.2,
    });

    return NextResponse.json({ result: output });
  } catch (e: unknown) {
    console.error("[ai/risk-prediction]", e);
    const msg = e instanceof Error ? e.message : "Risk prediction failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
