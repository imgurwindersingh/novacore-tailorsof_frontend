import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { Metadata } from "next";
import { Scissors } from "lucide-react";
import {
  GENERAL_MEASUREMENT_LABELS,
  ORDER_STATUS_LABELS,
  PANT_MEASUREMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIRT_MEASUREMENT_LABELS,
} from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { getPublicClientRequest } from "@/lib/api/clients";
import { ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicClientProfile, PublicOrderDetail, OrderStatus, PaymentStatus } from "@/lib/types";

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const client = await getPublicClientRequest(id);
    return {
      title: `${client.fullName} — Order Profile`,
      description: `View order and measurement details for ${client.fullName}`,
    };
  } catch {
    return { title: "Client Profile" };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Measurements section ───────────────────────────────────────────────────────

function MeasurementGroup({
  title,
  unit,
  values,
  labels,
}: {
  title: string;
  unit: string;
  values: Record<string, number | null>;
  labels: Record<string, string>;
}) {
  const entries = Object.entries(values).filter(([, v]) => v != null);
  if (entries.length === 0) return null;
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="secondary">{unit}</Badge>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs text-muted-foreground">{labels[key] ?? key}</dt>
              <dd className="text-sm font-medium">
                {value} {unit.toLowerCase()}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function MeasurementsSection({ client }: { client: PublicClientProfile }) {
  const hasAny =
    client.generalMeasurement || client.shirtMeasurement || client.pantMeasurement;
  if (!hasAny) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Measurements</h2>
      <div className="space-y-3">
        {client.generalMeasurement ? (
          <MeasurementGroup
            title="General"
            unit={client.generalMeasurement.unit}
            values={{ height: client.generalMeasurement.height }}
            labels={GENERAL_MEASUREMENT_LABELS}
          />
        ) : null}
        {client.shirtMeasurement ? (
          <MeasurementGroup
            title="Shirt / Kurta"
            unit={client.shirtMeasurement.unit}
            values={{
              chest: client.shirtMeasurement.chest,
              waist: client.shirtMeasurement.waist,
              shoulderWidth: client.shirtMeasurement.shoulderWidth,
              sleeveLength: client.shirtMeasurement.sleeveLength,
              shirtLength: client.shirtMeasurement.shirtLength,
              neck: client.shirtMeasurement.neck,
              cuff: client.shirtMeasurement.cuff,
            }}
            labels={SHIRT_MEASUREMENT_LABELS}
          />
        ) : null}
        {client.pantMeasurement ? (
          <MeasurementGroup
            title="Pant / Trouser"
            unit={client.pantMeasurement.unit}
            values={{
              waist: client.pantMeasurement.waist,
              hip: client.pantMeasurement.hip,
              thigh: client.pantMeasurement.thigh,
              knee: client.pantMeasurement.knee,
              bottomOpening: client.pantMeasurement.bottomOpening,
              inseam: client.pantMeasurement.inseam,
            }}
            labels={PANT_MEASUREMENT_LABELS}
          />
        ) : null}
      </div>
    </section>
  );
}

// ── Orders section ─────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: PublicOrderDetail }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">{order.orderNumber}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={ORDER_STATUS_CLASSES[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <Badge variant="outline" className={PAYMENT_STATUS_CLASSES[order.paymentStatus]}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Order date</p>
            <p className="mt-1 text-sm font-semibold">
              {format(new Date(order.createdAt), "dd MMM yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Expected delivery</p>
            <p className="mt-1 text-sm font-semibold">
              {order.expectedDelivery
                ? format(new Date(order.expectedDelivery), "dd MMM yyyy")
                : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="mt-1 text-sm font-semibold">{formatINR(order.totalPaise)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Balance due</p>
            <p
              className={`mt-1 text-sm font-semibold ${
                order.duePaise > 0 ? "text-orange-600" : "text-green-600"
              }`}
            >
              {formatINR(order.duePaise)}
            </p>
          </div>
        </div>

        {/* Items */}
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
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let client: PublicClientProfile;
  try {
    client = await getPublicClientRequest(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const hasOrders = client.orders.length > 0;

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="size-4" />
          </div>
          <span className="font-semibold">Unique Tailors</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {/* Hero */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{client.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            Client since {format(new Date(client.createdAt), "MMMM yyyy")}
          </p>
        </div>

        {/* Measurements */}
        <MeasurementsSection client={client} />

        {/* Orders */}
        {hasOrders ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Orders{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({client.orders.length})
              </span>
            </h2>
            <div className="space-y-4">
              {client.orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        ) : (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            No orders recorded yet.
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        This is a read-only profile shared by Unique Tailors.
      </footer>
    </div>
  );
}
