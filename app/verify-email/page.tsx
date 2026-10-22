import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";

export const metadata = {
  title: "Verify Email — DemandPulse",
  description: "Verify your DemandPulse account email address.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-canvas">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-signal border-t-transparent" />
        </main>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
