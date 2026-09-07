"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Settings2 } from "lucide-react";
import { GARMENT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "tailorsof.default-garment-rates";
type Rates = Record<string, number>;

function readRates(): Rates {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([, rate]) => typeof rate === "number" && Number.isFinite(rate) && rate >= 0
      )
    );
  } catch {
    return {};
  }
}

export function useDefaultGarmentRates() {
  const [rates, setRates] = useState<Rates>({});

  useEffect(() => setRates(readRates()), []);

  function saveRates(next: Rates) {
    setRates(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return { rates, saveRates };
}

export function DefaultGarmentRates({
  rates,
  onSave,
}: {
  rates: Rates;
  onSave: (rates: Rates) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Rates>(rates);

  function openDialog(nextOpen: boolean) {
    if (nextOpen) setDraft(rates);
    setOpen(nextOpen);
  }

  function save() {
    const cleaned = Object.fromEntries(
      Object.entries(draft).filter(([, rate]) => Number.isFinite(rate) && rate > 0)
    );
    onSave(cleaned);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Settings2 className="size-3.5" /> Default rates
          </Button>
        }
      />
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Default garment rates</DialogTitle>
          <DialogDescription>
            Set the usual price for each garment. Choosing a garment will fill its rate automatically; you can still edit the rate for a specific order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {GARMENT_TYPES.map((garment) => (
            <div key={garment} className="space-y-1.5">
              <Label htmlFor={`default-rate-${garment}`}>{garment} (₹)</Label>
              <Input
                id={`default-rate-${garment}`}
                type="number"
                min={0}
                step="0.01"
                placeholder="Not set"
                value={draft[garment] ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((current) => ({
                    ...current,
                    [garment]: value === "" ? 0 : Number(value),
                  }));
                }}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDraft({})}>
            <RotateCcw className="size-4" /> Reset all
          </Button>
          <Button type="button" onClick={save}>Save rates</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
