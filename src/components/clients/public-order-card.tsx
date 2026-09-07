"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { formatINR } from "@/lib/money";
import type { OrderStatus, PaymentStatus, PublicOrderDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
  PAID: "border-green-600/30 bg-green-600/10 text-green-700",
  PARTIAL: "border-orange-600/30 bg-orange-600/10 text-orange-700",
  PENDING: "border-red-600/30 bg-red-600/10 text-red-700",
};

const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  IN_PROGRESS: "border-blue-600/30 bg-blue-600/10 text-blue-700",
  COMPLETED: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700",
  DELIVERED: "border-green-600/30 bg-green-600/10 text-green-700",
  CANCELLED: "border-zinc-600/30 bg-zinc-600/10 text-zinc-500",
};

// Detail body — shared between always-open and toggled views
function OrderDetail({ order }: { order: PublicOrderDetail }) {
  return (
    <CardContent className="space-y-4">
      {/* Date + totals compact row */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-lg bg-muted/50 px-4 py-3 text-sm">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Order date</p>
          <p className="mt-0.5 font-semibold">
            {format(new Date(order.createdAt), "dd MMM yyyy")}
          </p>
        </div>
        {order.expectedDelivery && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Expected delivery
            </p>
            <p className="mt-0.5 font-semibold">
              {format(new Date(order.expectedDelivery), "dd MMM yyyy")}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total</p>
          <p className="mt-0.5 font-semibold">{formatINR(order.totalPaise)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Balance due</p>
          <p
            className={`mt-0.5 font-semibold ${
              order.duePaise > 0 ? "text-orange-600" : "text-green-600"
            }`}
          >
            {formatINR(order.duePaise)}
          </p>
        </div>
      </div>

      {/* Items table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-2 font-medium text-muted-foreground">Garment</th>
              <th className="hidden px-4 py-2 font-medium text-muted-foreground sm:table-cell">
                Notes
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Qty</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                Unit price
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{item.garmentType}</td>
                <td className="hidden px-4 py-2 text-muted-foreground sm:table-cell">
                  {item.description || "—"}
                </td>
                <td className="px-4 py-2 text-right">{item.quantity}</td>
                <td className="px-4 py-2 text-right">{formatINR(item.unitPricePaise)}</td>
                <td className="px-4 py-2 text-right font-medium">
                  {formatINR(item.quantity * item.unitPricePaise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment summary */}
      <div className="flex justify-end gap-8 text-sm">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="font-medium text-green-700">{formatINR(order.paidPaise)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Due</p>
          <p className="font-medium text-orange-700">{formatINR(order.duePaise)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold">{formatINR(order.totalPaise)}</p>
        </div>
      </div>

      {order.notes ? (
        <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Note: </span>
          {order.notes}
        </p>
      ) : null}
    </CardContent>
  );
}

export function PublicOrderCard({ order }: { order: PublicOrderDetail }) {
  // Only DELIVERED orders get the show/hide toggle; all others are always open.
  const isDelivered = order.status === "DELIVERED";
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        {/* Left: order number + status badges — single row, no wrap */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <CardTitle className="text-base font-semibold">
            {order.orderNumber}
          </CardTitle>
          <Badge variant="outline" className={ORDER_STATUS_CLASSES[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <Badge variant="outline" className={PAYMENT_STATUS_CLASSES[order.paymentStatus]}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
        </div>

        {/* Right: toggle button — only for DELIVERED orders */}
        {isDelivered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide order details" : "Show order details"}
            className="ml-4 shrink-0 gap-1 text-xs"
          >
            {expanded ? (
              <>Hide <ChevronUp className="size-3.5" /></>
            ) : (
              <>Show <ChevronDown className="size-3.5" /></>
            )}
          </Button>
        )}
      </CardHeader>

      {/* ── Detail body ──────────────────────────────────────────────────── */}
      {/* Non-delivered: always show. Delivered: show only when expanded. */}
      {(!isDelivered || expanded) && <OrderDetail order={order} />}
    </Card>
  );
}
