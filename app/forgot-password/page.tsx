"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-sm border-border bg-surface">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-signal" />
            <span className="text-sm font-semibold text-ink">DemandPulse</span>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <MailCheck className="mx-auto h-10 w-10 text-good" />
              <div>
                <h1 className="text-lg font-semibold text-ink">Check your inbox</h1>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  If an account exists for <strong className="text-ink">{email || "that address"}</strong>,
                  a secure password reset link has been dispatched.
                </p>
              </div>

              {/* Dev Simulation link */}
              {devToken && (
                <div className="rounded bg-surface-raised border border-signal/40 p-3 text-left text-xs font-mono space-y-1">
                  <span className="text-signal font-bold">[Dev Mode Simulation]</span>
                  <p className="text-ink-muted text-[11px]">Click to reset immediately:</p>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(devToken)}`}
                    className="text-signal underline text-[11px] block break-all"
                  >
                    Reset with Token ({devToken.slice(0, 16)}...)
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full text-xs">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-semibold text-ink">Reset your password</h1>
                <p className="text-xs text-ink-muted">
                  Enter your work email and we'll send you a password recovery link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs text-ink-muted">Work email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@company.com"
                    required
                    className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-signal"
                  />
                </label>

                <Button type="submit" variant="signal" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending reset link...</span>
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <div className="text-center pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
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
