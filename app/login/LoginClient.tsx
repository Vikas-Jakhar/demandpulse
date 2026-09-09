"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("admin@demandpulse.io");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

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
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-signal" />
            <span className="text-sm font-medium text-ink">DemandPulse</span>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-ink">Sign in</h1>
            <p className="text-xs text-ink-muted">Access your forecasting workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />

            {error && (
              <div className="flex items-center gap-2 rounded border border-bad/30 bg-bad/10 p-2 text-xs text-bad">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" variant="signal" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGuest} disabled={isLoading}>
            Continue as guest (demo mode)
          </Button>

          <div className="flex justify-between text-xs text-ink-faint">
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
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
      />
    </label>
  );
}
