import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { getChatModel } from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const safetySystem = `You are a knowledgeable assistant for environmental, health, and safety (EHS), ESG (environmental, social, governance), industrial hygiene, process safety, and workplace compliance.
Provide clear, practical guidance. When asked about regulations (OSHA, EPA, REACH, etc.), summarize common practices and urge verification against current legal text and local rules.
You are not a lawyer or certified safety professional — remind the user to consult qualified experts for legal or site-specific decisions.
Keep answers concise unless the user asks for depth.`;

const messageSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(12_000),
  })
);

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

  const parsed = messageSchema.safeParse((body as { messages?: unknown }).messages);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
  }

  const messages = parsed.data.slice(-24).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "At least one message is required" }, { status: 400 });
  }

  try {
    const result = streamText({
      model,
      system: safetySystem,
      messages,
      maxOutputTokens: 2048,
      temperature: 0.4,
    });
    return result.toTextStreamResponse();
  } catch (e: unknown) {
    console.error("[ai/safety-chat]", e);
    const msg = e instanceof Error ? e.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
