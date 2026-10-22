"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Loader2, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  const router = useRouter();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGuestDemo = async () => {
    try {
      setIsGuestLoading(true);
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <section className="relative py-20 bg-canvas border-t border-border overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-signal/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-signal/30 bg-surface-raised p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl shadow-black/60">
          {/* Subtle background circuit line */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-signal">
            <Zap className="h-48 w-48" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/10 px-3.5 py-1 text-xs text-signal font-mono font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>OPERATIONAL READINESS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink max-w-2xl mx-auto leading-tight">
            Take Control of Your Demand Volatility Today
          </h2>

          <p className="mt-4 text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Eliminate guesswork from your supply-chain planning. Test the full platform in guest mode
            instantly, or deploy on your private PostgreSQL infrastructure in minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={handleGuestDemo}
              disabled={isGuestLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-signal text-canvas font-semibold text-sm hover:bg-signal/90 shadow-lg shadow-signal/20 transition-all active:scale-[0.98]"
            >
              {isGuestLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>Launch Instant Guest Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link href="/signup">
              <Button variant="outline" size="lg" className="text-sm font-medium">
                Create Account
              </Button>
            </Link>

            <a href="#contact">
              <Button variant="ghost" size="lg" className="text-sm text-ink-muted hover:text-ink">
                Talk to Sales
              </Button>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-faint font-mono">
            <span>✔ Instant browser access</span>
            <span>•</span>
            <span>✔ No credit card required</span>
            <span>•</span>
            <span>✔ Full sample dataset included</span>
          </div>
        </div>
      </div>
    </section>
  );
}
