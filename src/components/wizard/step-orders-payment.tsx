"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatINR, rupeesToPaise } from "@/lib/money";
import type { PaymentMethod } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { GarmentCombobox } from "./garment-combobox";
import { DefaultGarmentRates, useDefaultGarmentRates } from "./default-garment-rates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = UseFormReturn<any>;

export function StepOrdersPayment({ form }: { form: AnyForm }) {
  const { rates, saveRates } = useDefaultGarmentRates();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "order.items",
  });

  const order = form.watch("order");
  const items = (order?.items ?? []) as {
    quantity?: number | string;
    unitPrice?: number | string;
  }[];
  const total = items.reduce(
    (sum, item) =>
      sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0),
    0
  );
  const advance = Number(order?.advance) || 0;
  const badge =
    total > 0 && advance >= total
      ? { label: "Paid", className: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400" }
      : advance > 0
        ? { label: "Partial", className: "bg-orange-600/10 text-orange-700 dark:text-orange-400" }
        : { label: "Pending", className: "bg-red-600/10 text-red-700 dark:text-red-400" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderErrors = (form.formState.errors as any)?.order;
  const itemErrors = orderErrors?.items as
    | Array<{ garmentType?: { message?: string }; quantity?: { message?: string }; unitPrice?: { message?: string } } | undefined>
    | undefined;
  const today = new Date().toISOString().slice(0, 10);

  function itemError(index: number): string | undefined {
    const e = itemErrors?.[index];
    return e?.garmentType?.message ?? e?.quantity?.message ?? e?.unitPrice?.message;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Order items</Label>
            <DefaultGarmentRates rates={rates} onSave={saveRates} />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ garmentType: "", description: "", designImageUrl: "", designReferenceUrl: "", quantity: 1, unitPrice: 0 })
            }
          >
            <Plus className="size-4" /> Add item
          </Button>
        </div>
        <div className="hidden grid-cols-[1fr_4.5rem_7rem_2.25rem] gap-2 px-0.5 text-xs font-medium text-muted-foreground sm:grid">
          <span>Garment</span>
          <span>Qty</span>
          <span>Rate (₹)</span>
          <span />
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-1">
              <div className="grid grid-cols-[1fr_4.5rem_7rem_2.25rem] items-center gap-2">
                <GarmentCombobox
                  value={String(form.watch(`order.items.${index}.garmentType`) ?? "")}
                  ariaInvalid={Boolean(itemErrors?.[index]?.garmentType)}
                  onChange={(value) => {
                    form.setValue(`order.items.${index}.garmentType`, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    if (rates[value] !== undefined) {
                      form.setValue(`order.items.${index}.unitPrice`, rates[value], {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                />
                <Input
                  type="number"
                  min={1}
                  step={1}
                  aria-label={`Item ${index + 1} quantity`}
                  aria-invalid={Boolean(itemErrors?.[index]?.quantity)}
                  {...form.register(`order.items.${index}.quantity`, { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  aria-label={`Item ${index + 1} unit price in rupees`}
                  aria-invalid={Boolean(itemErrors?.[index]?.unitPrice)}
                  {...form.register(`order.items.${index}.unitPrice`, { valueAsNumber: true })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${index + 1}`}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="grid gap-2 pt-1 sm:grid-cols-2">
                <Input
                  type="url"
                  placeholder="Design image URL (optional)"
                  aria-label={`Item ${index + 1} design image URL`}
                  {...form.register(`order.items.${index}.designImageUrl`)}
                />
                <Input
                  type="url"
                  placeholder="Design reference link (optional)"
                  aria-label={`Item ${index + 1} design reference link`}
                  {...form.register(`order.items.${index}.designReferenceUrl`)}
                />
              </div>
              {itemError(index) ? (
                <p className="text-xs text-destructive">{itemError(index)}</p>
              ) : null}
            </div>
          ))}
        </div>
        {typeof orderErrors?.items?.message === "string" ? (
          <p className="text-xs text-destructive">{orderErrors.items.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
        <span className="text-sm font-medium">Order total</span>
        <span className="flex items-center gap-2">
          <span className="text-base font-semibold tabular-nums">
            {formatINR(rupeesToPaise(total))}
          </span>
          <Badge className={badge.className}>{badge.label}</Badge>
        </span>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="order.expectedDelivery">Expected delivery *</Label>
          <Input
            id="order.expectedDelivery"
            type="date"
            min={today}
            aria-invalid={Boolean(orderErrors?.expectedDelivery)}
            {...form.register("order.expectedDelivery")}
          />
          {orderErrors?.expectedDelivery?.message ? (
            <p className="text-xs text-destructive">{orderErrors.expectedDelivery.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order.advance">Advance paid (₹)</Label>
          <Input
            id="order.advance"
            type="number"
            min={0}
            step={0.01}
            aria-invalid={Boolean(orderErrors?.advance)}
            {...form.register("order.advance", { valueAsNumber: true })}
          />
          {orderErrors?.advance?.message ? (
            <p className="text-xs text-destructive">{orderErrors.advance.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Leave 0 if nothing is paid yet.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order.paymentMethod">Payment method</Label>
          <Select
            value={order?.paymentMethod || null}
            onValueChange={(value) =>
              form.setValue("order.paymentMethod", (value as PaymentMethod) ?? "", {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger
              id="order.paymentMethod"
              className="w-full"
              aria-invalid={Boolean(orderErrors?.paymentMethod)}
            >
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method as PaymentMethod]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {orderErrors?.paymentMethod?.message ? (
            <p className="text-xs text-destructive">{orderErrors.paymentMethod.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Required only when an advance is paid.</p>
          )}
        </div>
      </div>
    </div>
  );
}
