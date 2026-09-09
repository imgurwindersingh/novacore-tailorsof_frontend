import { format } from "date-fns";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { DeliveryStatusToggle } from "@/components/clients/delivery-status-toggle";
import { RecordPaymentDialog } from "@/components/clients/record-payment-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientDetail } from "@/lib/types";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

const PAYMENT_STATUS_CLASSES: Record<string, string> = {
  PAID: "border-green-600/30 bg-green-600/10 text-green-700",
  PARTIAL: "border-orange-600/30 bg-orange-600/10 text-orange-700",
  PENDING: "border-red-600/30 bg-red-600/10 text-red-700",
};

export function ProfileCard({
  client,
}: {
  client: ClientDetail;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <Row label="Full name" value={client.fullName} />
            <Row label="Mobile" value={client.mobile} />
          </dl>
        </CardContent>
      </Card>

      {client.orders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Orders summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.orders.map((order) => (
                <div key={order.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ORDER_STATUS_LABELS[order.status]}</Badge>
                      <Badge variant="outline" className={PAYMENT_STATUS_CLASSES[order.paymentStatus]}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery date</p>
                      <p className="font-medium">
                        {order.expectedDelivery
                          ? format(new Date(order.expectedDelivery), "dd MMM yyyy")
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <div className="mt-1">
                        <DeliveryStatusToggle
                          orderId={order.id}
                          currentStatus={order.status}
                          paymentStatus={order.paymentStatus}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-medium">{formatINR(order.totalPaise)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due</p>
                      <p className={`font-medium ${order.duePaise > 0 ? "text-orange-700" : "text-green-700"}`}>
                        {formatINR(order.duePaise)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {order.items.map((item) => (
                      <span key={item.id} className="rounded bg-muted px-2 py-0.5 text-xs">
                        {item.garmentType} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                  {order.duePaise > 0 ? (
                    <RecordPaymentDialog orderId={order.id} duePaise={order.duePaise} clientId={client.id} />
                  ) : null}
                </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
