import { getCurrentSession } from "@/lib/auth/session";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  // Middleware already blocks unauthenticated requests to /dashboard/*;
  // this second check lets the page personalize by role (e.g. hide the
  // scenario slider / export controls for VIEWER-only accounts).
  const session = await getCurrentSession();

  return <DashboardClient role={session?.role ?? "VIEWER"} isGuest={session?.isGuest ?? false} />;
}
