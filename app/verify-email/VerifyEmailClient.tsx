"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Activity, CheckCircle2, AlertCircle, Mail, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const alreadyVerified = searchParams.get("verified") === "true";
  const urlError = searchParams.get("error");

  const [isLoading, setIsLoading] = React.useState(!!token);
  const [isSuccess, setIsSuccess] = React.useState(alreadyVerified);
  const [error, setError] = React.useState<string | null>(urlError);
  const [resendEmail, setResendEmail] = React.useState("");
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);
  const [devToken, setDevToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (token && !alreadyVerified) {
      let isMounted = true;
      (async () => {
        try {
          const res = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (isMounted) {
            if (res.ok) {
              setIsSuccess(true);
              setError(null);
            } else {
              setError(data.error || "Verification failed. Token may be invalid or expired.");
            }
          }
        } catch {
          if (isMounted) {
            setError("Network error while verifying email.");
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [token, alreadyVerified]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus(data.message || "Verification link sent! Check your inbox.");
        if (data.devToken) {
          setDevToken(data.devToken);
        }
      } else {
        setResendStatus(data.error || "Failed to resend.");
      }
    } catch {
      setResendStatus("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0D] px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF6A00]/10 rounded-full blur-[140px] pointer-events-none" />

      <Card className="w-full max-w-md border-[#26262E] bg-[#151518] shadow-2xl shadow-black/90 relative z-10">
        <CardContent className="space-y-6 p-7 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B0B0D] border border-[#26262E]">
              <Activity className="h-4 w-4 text-[#FF6A00]" />
            </div>
            <span className="text-sm font-bold text-white">DemandPulse</span>
          </div>

          {isLoading && (
            <div className="py-8 space-y-4">
              <Loader2 className="mx-auto h-10 w-10 text-[#FF6A00] animate-spin" />
              <div>
                <h1 className="text-lg font-bold text-white">Verifying your email...</h1>
                <p className="text-xs text-[#E2E8F0] mt-1">
                  Validating cryptographic token against security records.
                </p>
              </div>
            </div>
          )}

          {!isLoading && isSuccess && (
            <div className="py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Email Successfully Verified</h1>
                <p className="text-xs text-[#E2E8F0] mt-1.5 leading-relaxed">
                  Your DemandPulse account is now fully confirmed. You have unlocked complete access
                  to forecasting pipelines, model backtesting, and AI Copilot reasoning.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold text-xs shadow-md shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 hover:brightness-110 transition-all"
                >
                  <span>Enter Control Room Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {!isLoading && !isSuccess && (
            <div className="space-y-5 text-left">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 mb-3 shadow-[0_0_15px_rgba(255,106,0,0.2)]">
                  <Mail className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-extrabold text-white">Verify Your Email Address</h1>
                <p className="text-xs text-[#E2E8F0] mt-1">
                  We sent a confirmation link to your inbox. Click the link to activate your forecasting account.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-[#26262E]">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Didn't receive the email? Request another link:
                  </label>
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="h-9 w-full rounded-md border border-[#26262E] bg-[#0B0B0D] px-3 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#26262E] bg-[#0B0B0D] text-white text-xs font-semibold hover:border-[#FF6A00]/50 hover:text-[#FF6A00] transition-all"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF6A00]" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Resend Verification Link</span>
                    </>
                  )}
                </button>

                {resendStatus && (
                  <p className="text-center text-xs text-[#10B981] font-mono">{resendStatus}</p>
                )}

                {devToken && (
                  <div className="p-3 rounded-lg bg-[#0B0B0D] border border-[#FF6A00]/40 text-left text-xs font-mono space-y-1">
                    <span className="text-[#FF6A00] font-bold">[Dev Mode Simulation]</span>
                    <p className="text-[#94A3B8] text-[11px]">Click below to verify immediately:</p>
                    <a
                      href={`/verify-email?token=${encodeURIComponent(devToken)}`}
                      className="text-[#FF6A00] hover:text-[#FF9D2E] underline text-[11px] block break-all font-semibold"
                    >
                      Verify Token: {devToken.slice(0, 16)}...
                    </a>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#26262E]">
                <Link href="/dashboard" className="hover:text-[#FF6A00] transition-colors">
                  Skip to Dashboard →
                </Link>
                <Link href="/login" className="hover:text-[#FF6A00] transition-colors">
                  Sign in with another account
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
