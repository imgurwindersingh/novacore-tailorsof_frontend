import Link from "next/link";
import { AlertTriangle, Plus, Users } from "lucide-react";
import { ClientSearch } from "@/components/clients/client-search";
import { ClientsTable } from "@/components/clients/clients-table";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listClientsRequest } from "@/lib/api/clients";
import type { ClientListResult } from "@/lib/types";

export const metadata = {
  title: "Clients",
};

const DEFAULT_RESULT: ClientListResult = {
  clients: [],
  page: 1,
  total: 0,
  pages: 1,
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const rawPage = typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  let result: ClientListResult = DEFAULT_RESULT;
  let errorMsg: string | null = null;

  try {
    result = await listClientsRequest({ q, page });
  } catch (err) {
    console.error("Failed to load clients list from backend:", err);
    errorMsg =
      err instanceof Error
        ? err.message
        : "Failed to load clients from backend API.";
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="Search, view and manage your tailoring clients"
        actions={
          <Link href="/clients/new" className={buttonVariants()}>
            <Plus className="size-4" />
            Add client
          </Link>
        }
      />
      <div className="space-y-6">
        <ClientSearch initialQuery={q} />
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="font-semibold">Backend API Notice ({errorMsg})</p>
              <p className="text-xs text-muted-foreground">
                Could not retrieve clients from the backend server. If using the Cloudflare Worker URL, verify that its database is configured, or use the local backend (<code className="font-mono text-foreground">http://localhost:3001</code>).
              </p>
            </div>
          </div>
        )}
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {q ? "Results found" : "Total clients"}
              </p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight">{result.total}</p>
            </div>
          </CardContent>
        </Card>
        <ClientsTable
          rows={result.clients}
          page={result.page}
          pages={result.pages}
          total={result.total}
          q={q}
        />
      </div>
    </>
  );
}

