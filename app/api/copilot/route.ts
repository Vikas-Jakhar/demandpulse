import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { CopilotContext } from "@/types";
import { getCurrentSession } from "@/lib/auth/session";
import { buildCopilotSystemPrompt } from "@/lib/ai/context";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface CopilotRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context: CopilotContext | null;
}

/**
 * The grounding logic itself — including the "champion only, benchmarks on
 * request" instruction — lives in lib/ai/context.ts so the dashboard client
 * and this route build the exact same context shape via buildCopilotContext.
 * This route's job is just: auth check, call the model, return the reply.
 */
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as CopilotRequestBody;
    const systemPrompt = buildCopilotSystemPrompt(body.context);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Copilot route error:", err);
    return NextResponse.json({ error: "Failed to reach the copilot model." }, { status: 502 });
  }
}
