"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Zap } from "lucide-react";
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
    <section className="relative py-20 bg-[#0B0B0D] border-t border-[#26262E] overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#FF6A00]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#FF6A00]/40 bg-[#151518] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl shadow-black/90">
          {/* Subtle background circuit line */}
          <div className="absolute -top-10 -right-10 p-8 opacity-10 pointer-events-none text-[#FF6A00]">
            <Zap className="h-64 w-64" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-4 py-1 text-xs text-[#FF6A00] font-mono font-bold mb-6 shadow-[0_0_15px_rgba(255,106,0,0.2)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>OPERATIONAL READINESS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Take Control of Your Demand Volatility{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FF851A] to-[#FF9D2E]">
              Today
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#E2E8F0] max-w-xl mx-auto leading-relaxed">
            Eliminate guesswork from your supply-chain planning. Test the full platform in guest mode
            instantly, or deploy on your private PostgreSQL infrastructure in minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleGuestDemo}
              disabled={isGuestLoading}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold text-sm shadow-xl shadow-[#FF6A00]/30 hover:shadow-[#FF6A00]/50 hover:brightness-110 transition-all active:scale-[0.98]"
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
              <Button
                variant="outline"
                size="lg"
                className="text-sm font-semibold border-[#26262E] bg-[#0B0B0D] text-white hover:border-[#FF6A00]/50 hover:text-white hover:shadow-[0_0_15px_rgba(255,106,0,0.2)]"
              >
                Create Account
              </Button>
            </Link>

            <a href="#contact">
              <Button variant="ghost" size="lg" className="text-sm text-[#E2E8F0] hover:text-white">
                Talk to Sales
              </Button>
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-[#94A3B8] font-mono">
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
