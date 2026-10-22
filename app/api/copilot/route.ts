import { NextRequest, NextResponse } from "next/server";
import type { CopilotContext } from "@/types";
import { requireUser, toUnauthorizedResponse } from "@/lib/auth/require-user";
import { buildCopilotSystemPrompt } from "@/lib/ai/context";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getCopilotResponse } from "@/lib/ai/copilot-engine";

interface CopilotRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context: CopilotContext | null;
}

/**
 * Enhanced Copilot Route Handler.
 * Supports free available APIs:
 * - Google Gemini API (GEMINI_API_KEY / GOOGLE_API_KEY)
 * - Groq API (GROQ_API_KEY)
 * - OpenRouter Free Models (OPENROUTER_API_KEY)
 * - Anthropic Claude (ANTHROPIC_API_KEY)
 * - Built-in Grounded Statistical Intelligence Engine (zero-key fallback)
 */
export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return toUnauthorizedResponse(err)!;
  }

  const limited = enforceRateLimit("copilot", session.sub);
  if (limited) return limited;

  try {
    const body = (await req.json()) as CopilotRequestBody;
    const systemPrompt = buildCopilotSystemPrompt(body.context);

    const { reply, provider } = await getCopilotResponse(
      systemPrompt,
      body.messages || [],
      body.context
    );

    return NextResponse.json({ reply, provider });
  } catch (err) {
    console.error("Copilot route error:", err);
    return NextResponse.json(
      { error: "Failed to generate copilot response." },
      { status: 500 }
    );
  }
}
