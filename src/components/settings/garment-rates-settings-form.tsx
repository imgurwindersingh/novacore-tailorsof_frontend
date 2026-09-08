"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Shirt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GARMENT_TYPES } from "@/lib/constants";
import { updateGarmentRatesAction } from "@/lib/actions/settings.actions";
import type { GarmentRateEntry } from "@/lib/api/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = {
  id: string;
  garment: string;
  rate: string;
};

let nextId = 0;
function createRow(garment = "", rate = ""): Row {
  nextId += 1;
  return { id: `rate-row-${nextId}`, garment, rate };
}

function buildInitialRows(initialRates: Record<string, number>): Row[] {
  const rates = initialRates ?? {};
  const seen = new Set<string>();
  const rows = GARMENT_TYPES.map((garment) => {
    seen.add(garment.toLowerCase());
    return createRow(garment, rates[garment] != null ? String(rates[garment]) : "");
  });
  for (const [garment, rate] of Object.entries(rates)) {
    if (!seen.has(garment.toLowerCase())) {
      seen.add(garment.toLowerCase());
      rows.push(createRow(garment, String(rate)));
    }
  }
  return rows;
}

export function GarmentRatesSettingsForm({
  initialRates,
}: {
  initialRates: Record<string, number>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => buildInitialRows(initialRates));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addMore() {
    setRows((current) => [...current, createRow()]);
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  async function save() {
    setError(null);
    const entries: GarmentRateEntry[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const garment = row.garment.trim();
      const rate = Number(row.rate);
      if (!garment) continue;
      if (row.rate.trim() === "" || !Number.isFinite(rate) || rate < 0) continue;
      const key = garment.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ garment, rate });
    }

    setPending(true);
    const result = await updateGarmentRatesAction(entries);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRows(buildInitialRows(result.data.defaultGarmentRates));
    toast.success("Default garment rates saved");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="size-4 text-primary" />
          Default garment rates
        </CardTitle>
        <CardDescription>
          Usual price for each garment. When you pick a garment on a new order, its rate
          is filled automatically (you can still change it per order).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_7rem_2.25rem] gap-2 px-0.5 text-xs font-medium text-muted-foreground">
            <span>Garment</span>
            <span>Rate (₹)</span>
            <span />
          </div>
          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
              No default rates yet. Click “Add more” to set one.
            </p>
          ) : null}
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_7rem_2.25rem] items-center gap-2">
              <div className="space-y-1">
                <Label htmlFor={`garment-${row.id}`} className="sr-only">
                  Garment name
                </Label>
                <Input
                  id={`garment-${row.id}`}
                  value={row.garment}
                  onChange={(e) => updateRow(row.id, { garment: e.target.value })}
                  placeholder="e.g. Nehru Jacket"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`rate-${row.id}`} className="sr-only">
                  Rate in rupees
                </Label>
                <Input
                  id={`rate-${row.id}`}
                  type="number"
                  min={0}
                  step={0.01}
                  value={row.rate}
                  onChange={(e) => updateRow(row.id, { rate: e.target.value })}
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${row.garment || "garment"}`}
                onClick={() => removeRow(row.id)}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addMore}>
            <Plus className="size-4" /> Add more
          </Button>
          <Button type="button" onClick={() => void save()} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save rates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}