"use client";

import { format } from "date-fns";
import { Pencil } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
  GENERAL_MEASUREMENT_LABELS,
  PANT_MEASUREMENT_LABELS,
  PAYMENT_METHOD_LABELS,
  SHIRT_MEASUREMENT_LABELS,
} from "@/lib/constants";
import { formatINR, gstPaiseFor, rupeesToPaise } from "@/lib/money";
import type { PaymentMethod, Unit } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = UseFormReturn<any>;

function numeric(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} aria-label={label}>
      <Pencil className="size-3.5" /> Edit
    </Button>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}

export function StepReview({
  form,
  onEdit,
}: {
  form: AnyForm;
  onEdit: (step: number) => void;
}) {
  const profile = form.watch("profile");
  const measurements = form.watch("measurements");
  const order = form.watch("order");
  const unit: Unit = measurements?.unit ?? "CM";

  const measureGroups = (
    [
      { title: "General", labels: GENERAL_MEASUREMENT_LABELS, values: measurements?.general },
      { title: "Shirt / Kurta", labels: SHIRT_MEASUREMENT_LABELS, values: measurements?.shirt },
      { title: "Pant / Trouser", labels: PANT_MEASUREMENT_LABELS, values: measurements?.pant },
    ] as const
  )
    .map((group) => ({
      title: group.title,
      rows: Object.entries(group.values ?? {})
        .map(([key, raw]) => ({
          key,
          label: group.labels[key as keyof typeof group.labels] ?? key,
          value: numeric(raw),
        }))
        .filter((row) => row.value != null),
    }))
    .filter((group) => group.rows.length > 0);

  const items = (order?.items ?? []) as {
    garmentType?: string;
    quantity?: number;
    unitPrice?: number;
  }[];
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0),
    0
  );
  const gstRate = Number(order?.gstRatePercent) || 0;
  const gstAmount = gstPaiseFor(subtotal, gstRate);
  const total = subtotal + gstAmount;
  const advance = Number(order?.advance) || 0;
  const due = Math.max(0, total - advance);
  const badge =
    total > 0 && advance >= total
      ? { label: "Paid", className: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400" }
      : advance > 0
        ? { label: "Partial", className: "bg-orange-600/10 text-orange-700 dark:text-orange-400" }
        : { label: "Pending", className: "bg-red-600/10 text-red-700 dark:text-red-400" };

  const delivery = (() => {
    const raw = typeof order?.expectedDelivery === "string" ? order.expectedDelivery : "";
    if (!raw) return null;
    try {
      return format(new Date(`${raw}T00:00:00`), "EEE, d MMM yyyy");
    } catch {
      return raw;
    }
  })();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Client profile</CardTitle>
          <EditButton label="Edit client profile" onClick={() => onEdit(0)} />
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border/60">
            <Row label="Full name" value={profile?.fullName} />
            <Row label="Mobile" value={profile?.mobile} />
            <Row label="Notes" value={profile?.notes} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            Measurements
            <Badge variant="outline">{unit === "CM" ? "Centimetres" : "Inches"}</Badge>
          </CardTitle>
          <EditButton label="Edit measurements" onClick={() => onEdit(1)} />
        </CardHeader>
        <CardContent>
          {measureGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No measurements recorded — they can be added later from the client page.
            </p>
          ) : (
            <div className="space-y-4">
              {measureGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {group.title}
                  </p>
                  <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                    {group.rows.map((row) => (
                      <Row key={row.key} label={row.label} value={`${row.value} ${unit}`} />
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Order &amp; payment</CardTitle>
          <EditButton label="Edit order and payment" onClick={() => onEdit(2)} />
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Garment</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const subtotal = (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item?.garmentType || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(item?.quantity) || 0}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatINR(rupeesToPaise(Number(item?.unitPrice) || 0))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatINR(rupeesToPaise(subtotal))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Separator />
          <dl className="divide-y divide-border/60">
            {gstRate > 0 ? (
              <>
                <Row label="Subtotal" value={formatINR(rupeesToPaise(subtotal))} />
                <Row
                  label={`GST (${gstRate}%)`}
                  value={formatINR(rupeesToPaise(gstAmount))}
                />
              </>
            ) : null}
            <Row label="Order total" value={formatINR(rupeesToPaise(total))} />
            <Row label="Advance paid" value={formatINR(rupeesToPaise(advance))} />
            <Row label="Balance due" value={formatINR(rupeesToPaise(due))} />
            <Row label="Expected delivery" value={delivery} />
            <Row
              label="Payment method"
              value={
                order?.paymentMethod
                  ? PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]
                  : null
              }
            />
          </dl>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment status</span>
            <Badge className={badge.className}>{badge.label}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
