import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TABLE_ROWS = [0, 1, 2, 3, 4, 5, 6, 7];

export default function ClientsLoading() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-8 w-full max-w-sm" />
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-full" />
          {TABLE_ROWS.map((key) => (
            <Skeleton key={key} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
