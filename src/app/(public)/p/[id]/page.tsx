import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { Metadata } from "next";
import { Scissors } from "lucide-react";
import { PublicDesignGallery } from "@/components/clients/public-design-gallery";
import { PublicOrderCard } from "@/components/clients/public-order-card";
import { PublicRefreshButton } from "@/components/clients/public-refresh-button";
import { getPublicClientRequest } from "@/lib/api/clients";
import { ApiError } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import type { PublicClientProfile } from "@/lib/types";

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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scissors className="size-4" />
            </div>
            <span className="font-semibold">Unique Tailors</span>
          </div>
          <PublicRefreshButton />
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
                <PublicOrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Design gallery — reference images & links at the bottom */}
            <PublicDesignGallery orders={client.orders} />
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
