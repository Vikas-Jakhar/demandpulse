"use client";

import * as React from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/useAppStore";
import type { CopilotContext, CopilotMessage } from "@/types";

interface CopilotPanelProps {
  buildContext: () => CopilotContext | null;
}

const SUGGESTED_PROMPTS = [
  "Summarize the current forecast",
  "Why does this SKU spike in week 3?",
  "What safety stock should we hold next month?",
];

export function CopilotPanel({ buildContext }: CopilotPanelProps) {
  const isOpen = useAppStore((s) => s.isCopilotOpen);
  const toggle = useAppStore((s) => s.toggleCopilot);
  const [messages, setMessages] = React.useState<CopilotMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: CopilotMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const context = buildContext();
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      if (!res.ok) throw new Error("Copilot request failed.");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply as string,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I couldn't reach the forecasting copilot service just now. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-signal text-canvas shadow-lg transition-transform hover:scale-105"
          aria-label="Open forecast copilot"
        >
          <Bot className="h-5 w-5" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-sm animate-slide-in-right flex-col border-l border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-signal" />
              <span className="text-sm font-medium text-ink">Forecast Copilot</span>
            </div>
            <button onClick={toggle} className="text-ink-faint hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-ink-muted">
                  Ask about anomalies, forecast drivers, or inventory buffers — grounded in your current
                  dataset and chart state.
                </p>
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="block w-full rounded border border-border-soft bg-surface-raised p-2 text-left text-xs text-ink-muted transition-colors hover:border-signal/40 hover:text-ink"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-signal text-canvas"
                    : "bg-surface-raised text-ink"
                )}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-1 text-ink-faint">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint [animation-delay:300ms]" />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this forecast…"
              className="h-9 flex-1 rounded border border-border bg-surface-raised px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-signal"
            />
            <Button type="submit" size="icon" variant="signal" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
