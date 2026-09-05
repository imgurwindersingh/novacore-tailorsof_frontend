import { IndianRupee, Scissors, Users, Wallet } from "lucide-react";
import { formatINR } from "@/lib/money";
import type { DashboardStats } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total clients" value={String(stats.totalClients)} icon={Users} />
      <StatCard
        label="Orders in progress"
        value={String(stats.ordersInProgress)}
        hint="Not yet completed"
        icon={Scissors}
      />
      <StatCard
        label="Pending amount"
        value={formatINR(stats.pendingAmountPaise)}
        hint="Across all unpaid orders"
        icon={IndianRupee}
      />
      <StatCard
        label="Collected this month"
        value={formatINR(stats.collectedThisMonthPaise)}
        icon={Wallet}
      />
    </div>
  );
}
