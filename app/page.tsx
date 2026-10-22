import { getCurrentSession } from "@/lib/auth/session";
import { HomePageClient } from "@/components/home/HomePageClient";

export const metadata = {
  title: "DemandPulse — Enterprise Demand Forecasting & Supply Chain Precision",
  description:
    "Autonomous demand forecasting platform: Champion model backtesting, calibrated uncertainty bands, dynamic safety stock, and an embedded AI copilot.",
};

export default async function HomePage() {
  const session = await getCurrentSession();
  const isLoggedIn = !!session;

  return <HomePageClient isLoggedIn={isLoggedIn} />;
}
