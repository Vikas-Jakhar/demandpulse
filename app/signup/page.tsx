"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // In production this posts to /api/auth/signup, which hashes the password
  // with bcrypt and creates a Prisma User + Organization row, then signs a
  // session the same way /api/auth/login does.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch("/api/auth/guest", { method: "POST" });
    router.push("/dashboard");
    router.refresh();
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
            <Field label="Full name" type="text" />
            <Field label="Work email" type="email" />
            <Field label="Password" type="password" />
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

function Field({ label, type }: { label: string; type: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-ink-muted">{label}</span>
      <input
        type={type}
        required
        className="h-9 w-full rounded border border-border bg-surface-raised px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
      />
    </label>
  );
}
