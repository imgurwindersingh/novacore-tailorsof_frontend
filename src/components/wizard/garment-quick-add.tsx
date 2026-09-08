"use client";

import { Plus } from "lucide-react";
import { GARMENT_TYPES } from "@/lib/constants";
import { formatINR, rupeesToPaise } from "@/lib/money";

/**
 * Clickable boxes for every standard garment (plus any custom ones in the
 * default rates). Clicking a box adds that item to the order using the saved
 * default rate when one exists.
 */
export function GarmentQuickAdd({
  defaultRates,
  onAdd,
  countOf,
}: {
  defaultRates: Record<string, number>;
  /** Called with the garment name to add a new order item for it. */
  onAdd: (garment: string) => void;
  /** Returns how many copies of a garment are already in the order. */
  countOf: (garment: string) => number;
}) {
  const seen = new Set<string>();
  const garments = GARMENT_TYPES.filter((garment) => {
    seen.add(garment.toLowerCase());
    return true;
  });
  for (const garment of Object.keys(defaultRates)) {
    if (!seen.has(garment.toLowerCase())) {
      seen.add(garment.toLowerCase());
      garments.push(garment);
    }
  }

  return (
    <div className="space-y-2">
      <p className="px-0.5 text-xs font-medium text-muted-foreground">
        Tap a garment to add it
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {garments.map((garment) => {
          const rate = defaultRates[garment];
          const count = countOf(garment);
          return (
            <button
              key={garment}
              type="button"
              onClick={() => onAdd(garment)}
              className="group flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{garment}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {rate != null && rate > 0 ? formatINR(rupeesToPaise(rate)) : "Tap to add"}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {count > 0 ? (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {count}
                  </span>
                ) : null}
                <Plus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}