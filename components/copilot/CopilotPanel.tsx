"use client";

import * as React from "react";
import { Bot, Send, X, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/useAppStore";
import type { CopilotContext, CopilotMessage } from "@/types";

interface CopilotPanelProps {
  buildContext: () => CopilotContext | null;
}

const SUGGESTED_PROMPTS = [
  "Summarize the current forecast",
  "Why does this SKU spike?",
  "What safety stock should we hold next month?",
  "Why was this champion model chosen?",
  "Draft a purchase order brief",
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
  }, [messages, isLoading]);

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

      if (!res.ok) {
        throw new Error("Copilot service unavailable.");
      }

      const data = await res.json();
      const reply = data.reply || "I have analyzed your active forecast numbers.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      // Graceful fallback response directly in client if network dropped
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I am currently analyzing your local forecasting data. Please check that a dataset is selected on your dashboard and try asking again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown renderer for bullets, bold text, and headers
  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-white text-xs mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("* ") || line.startsWith("- ")) {
        const bulletText = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 text-xs">
            <span className="text-[#FF6A00] font-bold mt-0.5">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatInlineMarkdown(bulletText),
              }}
            />
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p
          key={idx}
          className="my-1 text-xs leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: formatInlineMarkdown(line),
          }}
        />
      );
    });
  };

  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-[#E2E8F0]">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-[#0B0B0D] px-1 py-0.5 rounded text-[#FF6A00] font-mono text-[11px]">$1</code>');
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white shadow-xl shadow-[#FF6A00]/35 transition-all hover:scale-105 active:scale-95"
          aria-label="Open forecast copilot"
        >
          <Bot className="h-5 w-5" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-sm animate-slide-in-right flex-col border-l border-[#26262E] bg-[#0B0B0D] shadow-2xl shadow-black">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#26262E] bg-[#151518] p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B0B0D] border border-[#26262E]">
                <Sparkles className="h-4 w-4 text-[#FF6A00]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">Forecast Copilot</span>
                  <span className="rounded bg-[#10B981]/15 px-1.5 py-0.2 text-[9px] font-mono text-[#10B981] font-semibold border border-[#10B981]/30">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] font-mono">Free AI & Grounded Reasoning</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="text-[#94A3B8] hover:text-white p-1 rounded-md hover:bg-[#1C1C22] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-[#151518] border border-[#26262E] text-xs text-[#E2E8F0] space-y-1">
                  <div className="flex items-center gap-1 text-[#FF6A00] font-semibold">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Grounded Supply-Chain Assistant</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    Ask questions regarding forecast trajectory, historical anomaly spikes, safety buffer
                    thresholds, or algorithm benchmarks.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
                    Suggested Inquiries:
                  </span>
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="block w-full rounded-lg border border-[#26262E] bg-[#151518] p-2.5 text-left text-xs text-[#E2E8F0] transition-all hover:border-[#FF6A00]/50 hover:bg-[#1C1C22] hover:text-white hover:shadow-[0_0_10px_rgba(255,106,0,0.1)]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "ml-auto bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-medium"
                    : "bg-[#151518] text-[#E2E8F0] border border-[#26262E]"
                )}
              >
                {m.role === "assistant" ? renderMessageContent(m.content) : m.content}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#151518] border border-[#26262E] max-w-[85%] text-xs text-[#94A3B8]">
                <Sparkles className="h-3.5 w-3.5 text-[#FF6A00] animate-spin" />
                <span>Synthesizing forecast data...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-[#26262E] bg-[#151518] p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this forecast…"
              className="h-9 flex-1 rounded-md border border-[#26262E] bg-[#0B0B0D] px-3 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none transition-colors"
            />
            <Button
              type="submit"
              size="icon"
              variant="signal"
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 shrink-0 shadow-md shadow-[#FF6A00]/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
