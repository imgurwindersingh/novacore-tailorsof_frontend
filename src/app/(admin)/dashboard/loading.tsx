import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STAT_CARDS = [0, 1, 2, 3];
const CLIENT_ROWS = [0, 1, 2, 3, 4];

export default function DashboardLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((key) => (
          <Card key={key}>
            <CardContent className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-32" />
          {CLIENT_ROWS.map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
