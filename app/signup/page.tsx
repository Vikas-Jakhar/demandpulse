"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
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
            <h1 className="text-lg font-semibold text-ink">Create your account</h1>
            <p className="text-xs text-ink-muted">Start forecasting in minutes — no credit card required.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Full name" type="text" value={name} onChange={setName} />
            <Field label="Work email" type="email" value={email} onChange={setEmail} />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              hint="At least 8 characters, with letters and numbers."
            />

            {error && (
              <div className="flex items-center gap-2 rounded border border-bad/30 bg-bad/10 p-2 text-xs text-bad">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" variant="signal" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="text-center text-xs text-ink-faint">
            Already have an account?{" "}
            <Link href="/login" className="text-ink hover:underline">
              Sign in
            </Link>
          </p>
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
  hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={type === "password" ? 8 : undefined}
        className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
      />
      {hint && <span className="block text-[11px] text-ink-faint">{hint}</span>}
    </label>
  );
}
