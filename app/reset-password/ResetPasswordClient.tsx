"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
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
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0D] px-6">
        <Card className="w-full max-w-sm border-[#26262E] bg-[#151518] shadow-2xl">
          <CardContent className="space-y-4 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-[#EF4444]" />

            <p className="text-sm text-white">
              This reset link is missing its token. Request a new one from the
              sign-in page.
            </p>

            <Link
              href="/forgot-password"
              className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white text-xs font-bold shadow-md"
            >
              Request a new link
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

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

          {success ? (
            <div className="space-y-3 text-center py-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#10B981]" />

              <div>
                <h1 className="text-xl font-extrabold text-white">
                  Password updated
                </h1>
                <p className="mt-1 text-xs text-[#E2E8F0]">
                  Redirecting you to sign in…
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-extrabold text-white">
                  Choose a new password
                </h1>
                <p className="text-xs text-[#E2E8F0] mt-0.5">
                  This reset link expires 30 minutes after it was sent.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#E2E8F0]">
                    New password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-9 w-full rounded-md border border-[#26262E] bg-[#0B0B0D] px-3 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                  />
                  <span className="block text-[11px] text-[#94A3B8]">
                    At least 8 characters, with letters and numbers.
                  </span>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-[#E2E8F0]">
                    Confirm new password
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-9 w-full rounded-md border border-[#26262E] bg-[#0B0B0D] px-3 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                  />
                </label>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-2.5 text-xs text-[#EF4444]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold text-xs shadow-md shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating password…</span>
                    </span>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
