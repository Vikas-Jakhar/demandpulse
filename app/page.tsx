import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import { getCurrentSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getCurrentSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-canvas px-6 text-center">
      <div className="flex items-center gap-2 text-ink-muted">
        <Activity className="h-5 w-5 text-signal" />
        <span className="text-sm font-medium tracking-tight">DemandPulse</span>
      </div>
      <div className="max-w-lg space-y-3">
        <h1 className="text-3xl font-semibold text-ink">
          Forecast demand with the confidence of a control room.
        </h1>
        <p className="text-sm text-ink-muted">
          Upload your sales history, get statistically grounded forecasts with confidence bands,
          safety-stock recommendations, and an AI copilot that explains every spike.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="signal">Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline">Create account</Button>
        </Link>
      </div>
    </main>
  );
}
