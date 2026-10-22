import { getCurrentSession } from "@/lib/auth/session";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  return (
    <DashboardClient
      userName={session?.name ?? "Account"}
      isGuest={session?.isGuest ?? false}
      emailVerified={session?.emailVerified ?? false}
      image={session?.image ?? null}
    />
  );
}
