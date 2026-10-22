"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [devToken, setDevToken] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.devToken) {
        setDevToken(data.devToken);
      }
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0D] px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF6A00]/10 rounded-full blur-[140px] pointer-events-none" />

      <Card className="w-full max-w-sm border-[#26262E] bg-[#151518] shadow-2xl shadow-black/90 relative z-10">
        <CardContent className="space-y-5 p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B0B0D] border border-[#26262E]">
              <Activity className="h-4 w-4 text-[#FF6A00]" />
            </div>
            <span className="text-sm font-bold text-white">DemandPulse</span>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <MailCheck className="mx-auto h-12 w-12 text-[#10B981]" />
              <div>
                <h1 className="text-xl font-extrabold text-white">Check your inbox</h1>
                <p className="mt-1 text-xs text-[#E2E8F0] leading-relaxed">
                  If an account exists for <strong className="text-white">{email || "that address"}</strong>,
                  a secure password reset link has been dispatched.
                </p>
              </div>

              {devToken && (
                <div className="rounded-lg bg-[#0B0B0D] border border-[#FF6A00]/40 p-3 text-left text-xs font-mono space-y-1 shadow-[0_0_15px_rgba(255,106,0,0.1)]">
                  <span className="text-[#FF6A00] font-bold">[Dev Mode Simulation]</span>
                  <p className="text-[#94A3B8] text-[11px]">Click to reset immediately:</p>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(devToken)}`}
                    className="text-[#FF6A00] hover:text-[#FF9D2E] underline text-[11px] block break-all font-semibold"
                  >
                    Reset with Token ({devToken.slice(0, 16)}...)
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-block py-2.5 rounded-lg border border-[#26262E] bg-[#0B0B0D] text-xs font-semibold text-white hover:border-[#FF6A00]/50 hover:text-[#FF6A00] transition-all"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-extrabold text-white">Reset your password</h1>
                <p className="text-xs text-[#E2E8F0] mt-0.5">
                  Enter your work email and we'll send you a password recovery link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#E2E8F0]">Work email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@company.com"
                    required
                    className="h-9 w-full rounded-md border border-[#26262E] bg-[#0B0B0D] px-3 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none transition-colors"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold text-xs shadow-md shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending reset link...</span>
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>

              <div className="text-center pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#FF6A00] transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
