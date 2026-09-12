import { getCurrentSession } from "@/lib/auth/session";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  // Middleware already blocks unauthenticated requests to /dashboard/*;
  // this second read lets the page personalize by session state — e.g.
  // showing the "Guest demo" badge and restricting scenario planning to
  // real accounts. Full role-based access control (Viewer/Analyst/Admin)
  // was dropped along with the User.role column in Phase 1's leaner
  // schema; reintroduce both together if RBAC becomes a real requirement.
  const session = await getCurrentSession();

  return <DashboardClient userName={session?.name ?? "Account"} isGuest={session?.isGuest ?? false} />;
}
