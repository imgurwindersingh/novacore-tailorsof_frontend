"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Package, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { markOrderDeliveredAction, revertOrderDeliveryAction } from "@/lib/actions/orders.actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function DeliveryStatusToggle({
  orderId,
  currentStatus,
  paymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const isDelivered = currentStatus === "DELIVERED";
  const isCancelled = currentStatus === "CANCELLED";
  const isPaymentComplete = paymentStatus === "PAID";

  async function handleMarkDelivered() {
    if (!isPaymentComplete) {
      toast.error("Clear pending payment before marking as delivered");
      return;
    }
    setPending(true);
    const result = await markOrderDeliveredAction(orderId);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Marked as delivered");
    router.refresh();
  }

  async function handleRevertDelivery() {
    setPending(true);
    const result = await revertOrderDeliveryAction(orderId);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Delivery status reverted");
    router.refresh();
  }

  if (isCancelled) {
    return <Badge variant="outline">Cancelled</Badge>;
  }

  if (isDelivered) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5 border-green-600/30 bg-green-600/10 text-green-700"
          )}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3" />
          )}
          Delivered
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRevertDelivery}>
            <Undo2 className="mr-2 size-4" />
            Revert to pending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5"
        )}
        disabled={pending}
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : <Package className="size-3" />}
        Pending
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMarkDelivered} disabled={!isPaymentComplete}>
          <CheckCircle2 className="mr-2 size-4" />
          {isPaymentComplete ? "Mark as delivered" : "Payment pending"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
