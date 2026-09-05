"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import type { OrderDetail, PaymentStatus } from "@/lib/types";
import { markOrderDeliveredAction } from "@/lib/actions/orders.actions";
import { RecordPaymentDialog } from "@/components/clients/record-payment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function MarkDeliveredButton({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isPaymentComplete = paymentStatus === "PAID";

  async function onClick() {
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
    toast.success("Order marked as delivered");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={pending || !isPaymentComplete}
      title={!isPaymentComplete ? "Payment must be complete before marking as delivered" : undefined}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
      {isPaymentComplete ? "Mark delivered" : "Payment pending"}
    </Button>
  );
}

const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
  PAID: "border-green-600/30 bg-green-600/10 text-green-700",
  PARTIAL: "border-orange-600/30 bg-orange-600/10 text-orange-700",
  PENDING: "border-red-600/30 bg-red-600/10 text-red-700",
};

// clientId is passed down from parent page — we forward it to RecordPaymentDialog
function OrderCard({ order, clientId }: { order: OrderDetail; clientId?: string }) {
  const isDelivered = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{order.orderNumber}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{ORDER_STATUS_LABELS[order.status]}</Badge>
          <Badge variant="outline" className={PAYMENT_STATUS_CLASSES[order.paymentStatus]}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Delivery date</p>
            <p className="mt-1 text-sm font-semibold">
              {order.expectedDelivery
                ? format(new Date(order.expectedDelivery), "dd MMM yyyy")
                : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Order status</p>
            <p className="mt-1 text-sm font-semibold">{ORDER_STATUS_LABELS[order.status]}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Delivery status</p>
            <p className="mt-1 text-sm font-semibold">
              {isDelivered ? "Delivered" : isCancelled ? "Cancelled" : "Pending"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Payment</p>
            <p className="mt-1 text-sm font-semibold">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Garment</TableHead>
              <TableHead className="hidden sm:table-cell">Notes</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Line total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.garmentType}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {item.description || "—"}
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatINR(item.unitPricePaise)}</TableCell>
                <TableCell className="text-right">
                  {formatINR(item.quantity * item.unitPricePaise)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Separator />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <dl className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="font-semibold">{formatINR(order.totalPaise)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Paid</dt>
              <dd className="font-medium text-green-700">{formatINR(order.paidPaise)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Due</dt>
              <dd className="font-medium text-orange-700">{formatINR(order.duePaise)}</dd>
            </div>
          </dl>
          <div className="flex items-center gap-4">
            {order.expectedDelivery ? (
              <p className="text-sm text-muted-foreground">
                Delivery: {format(new Date(order.expectedDelivery), "dd MMM yyyy")}
              </p>
            ) : null}
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" ? (
              <MarkDeliveredButton orderId={order.id} paymentStatus={order.paymentStatus} />
            ) : null}
            {order.duePaise > 0 && clientId ? (
              <RecordPaymentDialog orderId={order.id} duePaise={order.duePaise} clientId={clientId} />
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrdersList({ orders, clientId }: { orders: OrderDetail[]; clientId?: string }) {
  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center text-sm text-muted-foreground">
        No orders recorded for this client yet.
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} clientId={clientId} />
      ))}
    </div>
  );
}
