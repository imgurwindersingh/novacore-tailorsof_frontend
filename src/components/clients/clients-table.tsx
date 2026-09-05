import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Users } from "lucide-react";
import { formatINR } from "@/lib/money";
import type { ClientRow } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientsPagination } from "@/components/clients/clients-pagination";

export function ClientsTable({
  rows,
  page,
  pages,
  total,
  q,
}: {
  rows: ClientRow[];
  page: number;
  pages: number;
  total: number;
  q: string;
}) {
  if (rows.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">
            {q ? `No clients match "${q}"` : "No clients yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q ? "Try a different name or mobile number." : "Add your first client to get started."}
          </p>
        </div>
        {!q && (
          <Link href="/clients/new" className={buttonVariants()}>
            Add your first client
          </Link>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead className="hidden md:table-cell">Added</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="relative hover:bg-muted/50">
                <TableCell>
                  <p className="font-medium">{row.fullName}</p>
                  {row.email ? (
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  ) : null}
                  <Link
                    href={`/clients/${row.id}`}
                    className="absolute inset-0"
                    aria-label={`View ${row.fullName}`}
                  />
                </TableCell>
                <TableCell>{row.mobile}</TableCell>
                <TableCell className="text-right">{row.orderCount}</TableCell>
                <TableCell className="text-right">
                  {row.duePaise > 0 ? (
                    <span className="font-medium text-orange-600">{formatINR(row.duePaise)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {format(new Date(row.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <div className="flex justify-end">
        <ClientsPagination page={page} pages={pages} q={q} />
      </div>
    </div>
  );
}
