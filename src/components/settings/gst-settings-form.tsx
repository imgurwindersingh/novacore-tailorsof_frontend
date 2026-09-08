"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { updateGstSettingsAction } from "@/lib/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GstSettingsForm({
  initialRate,
  initialNumber,
}: {
  initialRate: number | null;
  initialNumber: string | null;
}) {
  const router = useRouter();
  const [rate, setRate] = useState(initialRate != null ? String(initialRate) : "");
  const [gstNumber, setGstNumber] = useState(initialNumber ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(rateValue: string, numberValue: string) {
    setError(null);
    setPending(true);
    const parsedRate = rateValue.trim() === "" ? null : Number(rateValue);
    const rate = parsedRate == null || Number.isNaN(parsedRate) ? null : Math.trunc(parsedRate);
    const result = await updateGstSettingsAction({
      gstRatePercent: rate != null && rate >= 0 && rate <= 100 ? rate : null,
      gstNumber: numberValue.trim() || null,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRate(result.data.gstRatePercent != null ? String(result.data.gstRatePercent) : "");
    setGstNumber(result.data.gstNumber ?? "");
    toast.success("GST settings saved");
    router.refresh();
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    void save(rate, gstNumber);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptText className="size-4 text-primary" />
          GST &amp; Invoice
        </CardTitle>
        <CardDescription>
          Your business GSTIN and the default GST rate shown on order slips. The
          default rate is applied to new orders but can be changed per order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gst-number">GSTIN (GST number)</Label>
              <Input
                id="gst-number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="e.g. 22AAAAA0000A1Z5"
                className="uppercase"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Shown on the invoice for your shop. Leave empty to hide it.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst-rate">Default GST rate (%)</Label>
              <Input
                id="gst-rate"
                type="number"
                min={0}
                max={100}
                step={1}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 5"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Applied to new orders. Set 0 to disable GST by default.
              </p>
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save GST settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}