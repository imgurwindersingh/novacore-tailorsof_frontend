import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";
import { ClientSearch } from "@/components/clients/client-search";
import { StatCards } from "@/components/dashboard/stat-cards";
import { UpcomingDeliveries } from "@/components/dashboard/upcoming-deliveries";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getDashboardStatsRequest, getUpcomingDeliveriesRequest } from "@/lib/api/dashboard";
import type { DashboardStats, UpcomingDelivery } from "@/lib/types";

export const metadata = {
  title: "Dashboard",
};

const DEFAULT_STATS: DashboardStats = {
  totalClients: 0,
  ordersInProgress: 0,
  pendingAmountPaise: 0,
  collectedThisMonthPaise: 0,
};

export default async function DashboardPage() {
  let stats: DashboardStats = DEFAULT_STATS;
  let deliveries: UpcomingDelivery[] = [];
  let errorMsg: string | null = null;

  try {
    const [fetchedStats, fetchedDeliveries] = await Promise.all([
      getDashboardStatsRequest(),
      getUpcomingDeliveriesRequest(10),
    ]);
    stats = fetchedStats;
    deliveries = fetchedDeliveries;
  } catch (err) {
    console.error("Failed to load dashboard data from backend:", err);
    errorMsg =
      err instanceof Error
        ? err.message
        : "Failed to load statistics from backend API.";
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of your shop today"
        actions={
          <Link href="/clients/new" className={buttonVariants()}>
            <Plus className="size-4" />
            Add client
          </Link>
        }
      />
      <div className="space-y-6">
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="font-semibold">Backend API Notice ({errorMsg})</p>
              <p className="text-xs text-muted-foreground">
                Could not retrieve live statistics from the backend server. If using the Cloudflare Worker URL, verify that its database is configured and connected, or use the local backend (<code className="font-mono text-foreground">http://localhost:3001</code>).
              </p>
            </div>
          </div>
        )}
        <ClientSearch initialQuery="" />
        <StatCards stats={stats} />
        <UpcomingDeliveries deliveries={deliveries} />
      </div>
    </>
  );
}

