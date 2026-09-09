"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Production wiring: POST to /api/auth/forgot-password, which looks up the
  // user by email, issues a short-lived signed reset token (same `jose`
  // helper as session.ts), and emails a reset link. The response is
  // intentionally identical whether or not the email exists, so this
  // endpoint can't be used to enumerate registered accounts.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-signal" />
            <span className="text-sm font-medium text-ink">DemandPulse</span>
          </div>

          {submitted ? (
            <div className="space-y-3 text-center">
              <MailCheck className="mx-auto h-8 w-8 text-good" />
              <div>
                <h1 className="text-lg font-semibold text-ink">Check your inbox</h1>
                <p className="mt-1 text-xs text-ink-muted">
                  If an account exists for {email || "that address"}, a reset link is on its way.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-semibold text-ink">Reset your password</h1>
                <p className="text-xs text-ink-muted">
                  Enter your work email and we'll send you a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs text-ink-muted">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
                  />
                </label>
                <Button type="submit" variant="signal" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}

          <Link href="/login" className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
