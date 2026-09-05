"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { recordPaymentAction } from "@/lib/actions/payments.actions";
import { markOrderDeliveredAction } from "@/lib/actions/orders.actions";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatINR, rupeesToPaise } from "@/lib/money";
import type { PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";

export function RecordPaymentDialog({
  orderId,
  duePaise,
  clientId,
}: {
  orderId: string;
  duePaise: number;
  clientId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [note, setNote] = useState("");
  const [markDelivered, setMarkDelivered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountPaise = rupeesToPaise(Number(amount) || 0);
  const clearsDue = amountPaise >= duePaise;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await recordPaymentAction(
      orderId,
      { amount: Number(amount), method, note },
      clientId
    );
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    if (markDelivered && clearsDue) {
      const deliveryResult = await markOrderDeliveredAction(orderId);
      if (!deliveryResult.ok) {
        setPending(false);
        toast.success("Payment recorded");
        toast.error(deliveryResult.error);
      } else {
        toast.success("Payment recorded and order marked as delivered");
      }
    } else {
      toast.success(`Payment of ${formatINR(rupeesToPaise(Number(amount)))} recorded`);
    }
    setPending(false);
    setOpen(false);
    setAmount("");
    setNote("");
    setMarkDelivered(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
        Record payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>Due amount: {formatINR(duePaise)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount (₹)</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select
              value={method}
              onValueChange={(value) => setMethod((value ?? "CASH") as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-note">Note (optional)</Label>
            <Textarea
              id="payment-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="mark-delivered"
              checked={markDelivered}
              onCheckedChange={(checked) => setMarkDelivered(checked === true)}
              disabled={!clearsDue}
            />
            <Label htmlFor="mark-delivered" className="text-sm font-normal">
              {clearsDue ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Mark as delivered
                </span>
              ) : (
                "Mark as delivered (pay full amount to enable)"
              )}
            </Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
