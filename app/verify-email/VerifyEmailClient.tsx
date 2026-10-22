"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, CheckCircle2, AlertCircle, Mail, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function VerifyEmailClient() {
  const router = useRouter();
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

  // Auto-verify if token is provided in query
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
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-md border-border bg-surface">
        <CardContent className="space-y-6 p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-5 w-5 text-signal" />
            <span className="text-sm font-semibold text-ink">DemandPulse</span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-8 space-y-4">
              <Loader2 className="mx-auto h-10 w-10 text-signal animate-spin" />
              <div>
                <h1 className="text-lg font-semibold text-ink">Verifying your email...</h1>
                <p className="text-xs text-ink-muted mt-1">
                  Validating cryptographic token against security records.
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {!isLoading && isSuccess && (
            <div className="py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-good/15 text-good border border-good/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink">Email Successfully Verified</h1>
                <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                  Your DemandPulse account is now fully confirmed. You have unlocked complete access
                  to forecasting pipelines, model backtesting, and AI Copilot reasoning.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/dashboard">
                  <Button variant="signal" className="w-full gap-2">
                    <span>Enter Control Room Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Error / Resend State */}
          {!isLoading && !isSuccess && (
            <div className="space-y-5 text-left">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warn/15 text-warn border border-warn/30 mb-3">
                  <Mail className="h-6 w-6" />
                </div>
                <h1 className="text-lg font-semibold text-ink">Verify Your Email Address</h1>
                <p className="text-xs text-ink-muted mt-1">
                  We sent a confirmation link to your inbox. Click the link to activate your forecasting account.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded border border-bad/30 bg-bad/10 p-3 text-xs text-bad">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Resend Form */}
              <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-border/60">
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1">
                    Didn't receive the email? Request another link:
                  </label>
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-signal"
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full text-xs gap-1.5"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Resend Verification Link</span>
                    </>
                  )}
                </Button>

                {resendStatus && (
                  <p className="text-center text-xs text-good font-mono">{resendStatus}</p>
                )}

                {/* Dev Quick Action Link */}
                {devToken && (
                  <div className="p-2.5 rounded bg-surface-raised border border-signal/40 text-left text-xs font-mono space-y-1">
                    <span className="text-signal font-bold">[Dev Mode Simulation]</span>
                    <p className="text-ink-muted text-[11px]">Click below to verify immediately:</p>
                    <a
                      href={`/verify-email?token=${encodeURIComponent(devToken)}`}
                      className="text-signal underline text-[11px] block break-all"
                    >
                      Verify Token: {devToken.slice(0, 16)}...
                    </a>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-between text-xs text-ink-muted pt-2 border-t border-border/40">
                <Link href="/dashboard" className="hover:text-ink">
                  Skip to Dashboard →
                </Link>
                <Link href="/login" className="hover:text-ink">
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
