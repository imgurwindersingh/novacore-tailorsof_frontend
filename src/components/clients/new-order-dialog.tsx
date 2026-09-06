"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createOrderForClientAction } from "@/lib/actions/orders.actions";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "@/lib/constants";
import { formatINR, rupeesToPaise } from "@/lib/money";
import type { PaymentMethod } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { GarmentCombobox } from "@/components/wizard/garment-combobox";

// ── Zod schema ────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  garmentType: z.string().min(1, "Select a garment type"),
  description: z.string(),
  quantity: z.number({ error: "Enter a quantity" }).int().min(1, "Min 1"),
  unitPrice: z.number({ error: "Enter a price" }).positive("Must be > 0"),
});

const newOrderSchema = z
  .object({
    items: z.array(itemSchema).min(1, "Add at least one item"),
    expectedDelivery: z.string().min(1, "Select a delivery date"),
    advance: z.number({ error: "Enter an amount" }).min(0),
    paymentMethod: z.enum(["CASH", "UPI", "CARD", "OTHER"]).or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.advance > 0 && !data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a payment method when advance > 0",
        path: ["paymentMethod"],
      });
    }
  });

type NewOrderValues = z.infer<typeof newOrderSchema>;

const DEFAULT_ITEM = { garmentType: "", description: "", quantity: 1, unitPrice: 0 };

// ── Component ─────────────────────────────────────────────────────────────────

export function NewOrderDialog({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<NewOrderValues>({
    resolver: zodResolver(newOrderSchema),
    defaultValues: {
      items: [{ ...DEFAULT_ITEM }],
      expectedDelivery: "",
      advance: 0,
      paymentMethod: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedAdvance = form.watch("advance") ?? 0;
  const watchedPaymentMethod = form.watch("paymentMethod");

  const total = watchedItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const advance = Number(watchedAdvance) || 0;
  const badge =
    total > 0 && advance >= total
      ? { label: "Paid", className: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400" }
      : advance > 0
        ? { label: "Partial", className: "bg-orange-600/10 text-orange-700 dark:text-orange-400" }
        : { label: "Pending", className: "bg-red-600/10 text-red-700 dark:text-red-400" };

  const itemErrors = form.formState.errors.items as
    | Array<
        | {
            garmentType?: { message?: string };
            quantity?: { message?: string };
            unitPrice?: { message?: string };
          }
        | undefined
      >
    | undefined;

  function itemError(index: number): string | undefined {
    const e = itemErrors?.[index];
    return e?.garmentType?.message ?? e?.quantity?.message ?? e?.unitPrice?.message;
  }

  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(values: NewOrderValues) {
    const result = await createOrderForClientAction(clientId, {
      items: values.items,
      expectedDelivery: values.expectedDelivery,
      advance: values.advance,
      paymentMethod: values.paymentMethod as PaymentMethod | "",
    });

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(`Order ${result.data.orderNumber} created`);
    setOpen(false);
    form.reset();
    router.refresh();
  }

  const pending = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default">
            <ShoppingBag className="size-4" />
            New order
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
          <DialogDescription>Add a new order for {clientName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Items ────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Order items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ ...DEFAULT_ITEM })}
              >
                <Plus className="size-4" /> Add item
              </Button>
            </div>

            {/* Column headers */}
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
                      value={String(form.watch(`items.${index}.garmentType`) ?? "")}
                      ariaInvalid={Boolean(itemErrors?.[index]?.garmentType)}
                      onChange={(value) =>
                        form.setValue(`items.${index}.garmentType`, value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      aria-label={`Item ${index + 1} quantity`}
                      aria-invalid={Boolean(itemErrors?.[index]?.quantity)}
                      {...form.register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      aria-label={`Item ${index + 1} unit price in rupees`}
                      aria-invalid={Boolean(itemErrors?.[index]?.unitPrice)}
                      {...form.register(`items.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
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
                  {itemError(index) ? (
                    <p className="text-xs text-destructive">{itemError(index)}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {typeof form.formState.errors.items?.message === "string" ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.items.message}
              </p>
            ) : null}
          </div>

          {/* ── Running total ─────────────────────────────────────────────── */}
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

          {/* ── Delivery / Advance / Payment method ───────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Expected delivery */}
            <div className="space-y-1.5">
              <Label htmlFor="new-order-delivery">Expected delivery *</Label>
              <Input
                id="new-order-delivery"
                type="date"
                min={today}
                aria-invalid={Boolean(form.formState.errors.expectedDelivery)}
                {...form.register("expectedDelivery")}
              />
              {form.formState.errors.expectedDelivery?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.expectedDelivery.message}
                </p>
              ) : null}
            </div>

            {/* Advance */}
            <div className="space-y-1.5">
              <Label htmlFor="new-order-advance">Advance paid (₹)</Label>
              <Input
                id="new-order-advance"
                type="number"
                min={0}
                step={0.01}
                aria-invalid={Boolean(form.formState.errors.advance)}
                {...form.register("advance", { valueAsNumber: true })}
              />
              {form.formState.errors.advance?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.advance.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Leave 0 if nothing paid yet.
                </p>
              )}
            </div>

            {/* Payment method */}
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select
                value={watchedPaymentMethod || null}
                onValueChange={(value) =>
                  form.setValue(
                    "paymentMethod",
                    (value as PaymentMethod) ?? "",
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.paymentMethod)}
                >
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.paymentMethod?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.paymentMethod.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Required only when an advance is paid.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Create order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
