"use client";

import { CalendarClock } from "lucide-react";
import { datePlusDays } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * One-tap delivery shortcuts (e.g. "Next 10 days"). Clicking a chip fills the
 * expected-delivery date with today + N days.
 */
export function DeliveryPresetChips({
  presets,
  value,
  onSelect,
}: {
  presets: number[];
  /** Current expected-delivery value (YYYY-MM-DD) to highlight the matching chip. */
  value: string;
  /** Called with the computed date for the chosen preset. */
  onSelect: (date: string) => void;
}) {
  if (!presets || presets.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <CalendarClock className="size-3.5 text-muted-foreground" />
      {presets.map((days) => {
        const date = datePlusDays(days);
        const active = value === date;
        return (
          <button
            key={days}
            type="button"
            onClick={() => onSelect(date)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {days} days
          </button>
        );
      })}
    </div>
  );
}