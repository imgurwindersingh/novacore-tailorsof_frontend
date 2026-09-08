"use client";

import { Trash2 } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { datePlusDays } from "@/lib/dates";
import { formatINR, gstPaiseFor, rupeesToPaise } from "@/lib/money";
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
import { DeliveryPresetChips } from "./delivery-preset-chips";
import { GarmentCombobox } from "./garment-combobox";
import { GarmentQuickAdd } from "./garment-quick-add";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = UseFormReturn<any>;

export function StepOrdersPayment({
  form,
  defaultRates = {},
  deliveryPresets = [],
}: {
  form: AnyForm;
  defaultRates?: Record<string, number>;
  deliveryPresets?: number[];
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "order.items",
  });

  const order = form.watch("order");
  const items = (order?.items ?? []) as {
    garmentType?: string;
    quantity?: number | string;
    unitPrice?: number | string;
  }[];
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0),
    0
  );
  const gstRate = Number(order?.gstRatePercent) || 0;
  const gstAmount = gstPaiseFor(subtotal, gstRate);
  const total = subtotal + gstAmount;
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

  function addItem(garment = "") {
    const index = items.findIndex((item) => String(item?.garmentType) === garment);
    if (index >= 0) {
      form.setValue(`order.items.${index}.quantity`, (Number(items[index]?.quantity) || 0) + 1, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }
    append({
      garmentType: garment,
      description: "",
      quantity: 1,
      unitPrice: garment && defaultRates[garment] !== undefined ? defaultRates[garment] : 0,
    });
  }

  function countOf(garment: string): number {
    return items.reduce(
      (sum, item) =>
        sum + (String(item?.garmentType) === garment ? Number(item?.quantity) || 0 : 0),
      0
    );
  }

  return (
    <div className="space-y-6">
      <GarmentQuickAdd defaultRates={defaultRates} onAdd={addItem} countOf={countOf} />
      <div className="space-y-3">
        <Label>Order items</Label>
        {fields.length > 0 ? (
          <>
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
                        if (defaultRates[value] !== undefined) {
                          form.setValue(`order.items.${index}.unitPrice`, defaultRates[value], {
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
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                  {itemError(index) ? (
                    <p className="text-xs text-destructive">{itemError(index)}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            Tap a garment above to add it to this order.
          </p>
        )}
        {typeof orderErrors?.items?.message === "string" ? (
          <p className="text-xs text-destructive">{orderErrors.items.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
        <dl className="text-sm">
          <div className="flex items-baseline gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatINR(rupeesToPaise(subtotal))}</dd>
          </div>
          {gstRate > 0 ? (
            <div className="flex items-baseline gap-4">
              <dt className="text-muted-foreground">GST ({gstRate}%)</dt>
              <dd className="tabular-nums">{formatINR(rupeesToPaise(gstAmount))}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline gap-4">
            <dt className="font-medium">Order total</dt>
            <dd className="font-semibold tabular-nums">{formatINR(rupeesToPaise(total))}</dd>
          </div>
        </dl>
        <Badge className={badge.className}>{badge.label}</Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="order.expectedDelivery">Expected delivery *</Label>
          <Input
            id="order.expectedDelivery"
            type="date"
            min={today}
            aria-invalid={Boolean(orderErrors?.expectedDelivery)}
            {...form.register("order.expectedDelivery")}
          />
          <DeliveryPresetChips
            presets={deliveryPresets}
            value={String(order?.expectedDelivery ?? "")}
            onSelect={(date) =>
              form.setValue("order.expectedDelivery", date, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
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
        <div className="space-y-1.5">
          <Label htmlFor="order.gstRatePercent">GST rate (%)</Label>
          <Input
            id="order.gstRatePercent"
            type="number"
            min={0}
            max={100}
            step={1}
            aria-invalid={Boolean(
              (orderErrors as { gstRatePercent?: { message?: string } } | undefined)?.gstRatePercent
            )}
            {...form.register("order.gstRatePercent", { valueAsNumber: true })}
          />
          {(orderErrors as { gstRatePercent?: { message?: string } } | undefined)
            ?.gstRatePercent?.message ? (
            <p className="text-xs text-destructive">
              {(orderErrors as { gstRatePercent?: { message?: string } } | undefined)
                ?.gstRatePercent?.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Defaults to the shop rate. Set 0 for no GST.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
