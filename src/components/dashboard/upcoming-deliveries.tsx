"use client";

import Link from "next/link";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { CalendarClock, ChevronRight, Package } from "lucide-react";
import { formatINR } from "@/lib/money";
import type { UpcomingDelivery } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function deliveryLabel(date: Date): { text: string; variant: "default" | "destructive" | "secondary" } {
  if (isToday(date)) return { text: "Today", variant: "destructive" };
  if (isPast(date)) return { text: "Overdue", variant: "destructive" };
  return { text: format(date, "dd MMM"), variant: "default" };
}

export function UpcomingDeliveries({ deliveries }: { deliveries: UpcomingDelivery[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming deliveries</CardTitle>
        <CardAction>
          <Link href="/clients" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View all
            <ChevronRight className="size-4" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <CalendarClock className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No upcoming deliveries</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Orders with expected delivery dates will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {deliveries.map((d) => {
              const date = new Date(d.expectedDelivery);
              const label = deliveryLabel(date);
              return (
                <li key={d.orderId}>
                  <div className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3">
                    <Link
                      href={`/clients/${d.clientId}`}
                      className="flex min-w-0 flex-1 items-center gap-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Package className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{d.clientName}</p>
                          <Badge variant={label.variant} className="shrink-0 text-[10px]">
                            {label.text}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {d.garmentTypes.join(", ")} · {d.orderNumber}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </p>
                        {d.duePaise > 0 ? (
                          <p className="text-sm font-medium text-orange-600">
                            {formatINR(d.duePaise)} due
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Paid</p>
                        )}
                      </div>
                    </Link>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
