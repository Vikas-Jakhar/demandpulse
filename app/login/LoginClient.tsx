"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Activity, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [email, setEmail] = React.useState("admin@demandpulse.io");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(urlError);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setIsLoading(true);

    try {
      await fetch("/api/auth/guest", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0D] px-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF6A00]/10 rounded-full blur-[140px] pointer-events-none" />

      <Card className="w-full max-w-sm border-[#26262E] bg-[#151518] shadow-2xl shadow-black/90 relative z-10">
        <CardContent className="space-y-5 p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B0B0D] border border-[#26262E]">
              <Activity className="h-4 w-4 text-[#FF6A00]" />
            </div>
            <span className="text-sm font-bold text-white">DemandPulse</span>
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-white">Sign in</h1>
            <p className="text-xs text-[#E2E8F0] mt-0.5">
              Access your forecasting workspace and champion models.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <a
            href="/api/auth/google"
            onClick={() => setIsGoogleLoading(true)}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#26262E] bg-[#0B0B0D] px-4 py-2.5 text-xs font-semibold text-white transition-all hover:border-[#FF6A00]/50 hover:bg-[#1C1C22] hover:shadow-[0_0_15px_rgba(255,106,0,0.15)]"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#FF6A00]" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </a>

          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <div className="h-px flex-1 bg-[#26262E]" />
            or sign in with email
            <div className="h-px flex-1 bg-[#26262E]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Field
              label="Work Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@company.com"
            />

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

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
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <div className="h-px flex-1 bg-[#26262E]" />
            or
            <div className="h-px flex-1 bg-[#26262E]" />
          </div>

          <button
            onClick={handleGuest}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0B0B0D] border border-[#26262E] text-white text-xs font-semibold hover:border-[#FF6A00]/50 hover:text-[#FF6A00] transition-all hover:shadow-[0_0_15px_rgba(255,106,0,0.15)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FF6A00]" />
            <span>Continue as guest (demo mode)</span>
          </button>

          <div className="flex justify-between text-xs text-[#94A3B8] pt-1">
            <Link href="/signup" className="hover:text-[#FF6A00] transition-colors">
              Create account
            </Link>

            <Link href="/forgot-password" className="hover:text-[#FF6A00] transition-colors">
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-[#E2E8F0]">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-9 w-full rounded-md border border-[#26262E] bg-[#0B0B0D] px-3 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none transition-colors"
      />
    </label>
  );
}
