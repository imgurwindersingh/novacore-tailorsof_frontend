"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateDeliveryPresetsAction } from "@/lib/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = {
  id: string;
  days: string;
};

let nextId = 0;
function createRow(days = ""): Row {
  nextId += 1;
  return { id: `preset-${nextId}`, days };
}

export function DeliveryPresetsSettingsForm({
  initialPresets,
}: {
  initialPresets: number[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() =>
    (initialPresets?.length ? initialPresets : [10, 20]).map((d) => createRow(String(d)))
  );
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
    const presets: number[] = [];
    const seen = new Set<number>();
    for (const row of rows) {
      const days = Number(row.days);
      if (row.days.trim() === "" || !Number.isInteger(days) || days < 1 || days > 365) continue;
      if (seen.has(days)) continue;
      seen.add(days);
      presets.push(days);
    }

    setPending(true);
    const result = await updateDeliveryPresetsAction(presets);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRows((result.data.deliveryPresets ?? []).map((d) => createRow(String(d))));
    toast.success("Delivery presets saved");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          Expected delivery presets
        </CardTitle>
        <CardDescription>
          One-tap delivery shortcuts when creating an order — e.g. “Next 10 days”.
          Tapping a preset fills the delivery date automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor={`preset-${row.id}`} className="sr-only">
                  Days
                </Label>
                <Input
                  id={`preset-${row.id}`}
                  type="number"
                  min={1}
                  max={365}
                  step={1}
                  value={row.days}
                  onChange={(e) => updateRow(row.id, { days: e.target.value })}
                  placeholder="e.g. 15"
                  autoComplete="off"
                />
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">
                day{Number(row.days) === 1 ? "" : "s"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${row.days}-day preset`}
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
            Save presets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}