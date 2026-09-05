import { format } from "date-fns";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import type { ClientDetail } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PaymentsList({ client }: { client: ClientDetail }) {
  const payments = client.orders
    .flatMap((order) =>
      order.payments.map((payment) => ({ ...payment, orderNumber: order.orderNumber }))
    )
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  if (payments.length === 0) {
    return (
      <Card className="p-12 text-center text-sm text-muted-foreground">
        No payments recorded yet.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="hidden sm:table-cell">Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="text-muted-foreground">
                {format(new Date(payment.paidAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="font-medium">{payment.orderNumber}</TableCell>
              <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {payment.note || "—"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatINR(payment.amountPaise)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
