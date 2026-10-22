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
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Card className="w-full max-w-sm border-border bg-surface">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-signal" />
            <span className="text-sm font-semibold text-ink">DemandPulse</span>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-ink">Sign in</h1>
            <p className="text-xs text-ink-muted">
              Access your forecasting workspace and champion models.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <a
            href="/api/auth/google"
            onClick={() => setIsGoogleLoading(true)}
            className="flex w-full items-center justify-center gap-2.5 rounded border border-border bg-surface-raised px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-signal/50 hover:bg-canvas"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-signal" />
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

          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <div className="h-px flex-1 bg-border" />
            or sign in with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
              <div className="flex items-center gap-2 rounded border border-bad/30 bg-bad/10 p-2 text-xs text-bad">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="signal"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full gap-1.5 text-xs"
            onClick={handleGuest}
            disabled={isLoading}
          >
            <Sparkles className="h-3.5 w-3.5 text-signal" />
            <span>Continue as guest (demo mode)</span>
          </Button>

          <div className="flex justify-between text-xs text-ink-faint pt-1">
            <Link href="/signup" className="hover:text-ink">
              Create account
            </Link>

            <Link href="/forgot-password" className="hover:text-ink">
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
      <span className="text-xs text-ink-muted">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-signal"
      />
    </label>
  );
}
