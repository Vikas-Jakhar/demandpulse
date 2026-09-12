"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to reset password.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <Card className="w-full max-w-sm">
          <CardContent className="space-y-4 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-bad" />

            <p className="text-sm text-ink">
              This reset link is missing its token. Request a new one from the
              sign-in page.
            </p>

            <Link href="/forgot-password">
              <Button variant="signal" size="sm">
                Request a new link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-signal" />
            <span className="text-sm font-medium text-ink">DemandPulse</span>
          </div>

          {success ? (
            <div className="space-y-3 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-good" />

              <div>
                <h1 className="text-lg font-semibold text-ink">
                  Password updated
                </h1>

                <p className="mt-1 text-xs text-ink-muted">
                  Redirecting you to sign in…
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-semibold text-ink">
                  Choose a new password
                </h1>

                <p className="text-xs text-ink-muted">
                  This reset link expires 30 minutes after it was sent.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs text-ink-muted">
                    New password
                  </span>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
                  />

                  <span className="block text-[11px] text-ink-faint">
                    At least 8 characters, with letters and numbers.
                  </span>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs text-ink-muted">
                    Confirm new password
                  </span>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
                  />
                </label>

                {error && (
                  <div className="flex items-center gap-2 rounded border border-bad/30 bg-bad/10 p-2 text-xs text-bad">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="signal"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating…" : "Update password"}
                </Button>
              </form>
            </>
          )}

          <Link
            href="/login"
            className="block text-center text-xs text-ink-faint hover:text-ink"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}