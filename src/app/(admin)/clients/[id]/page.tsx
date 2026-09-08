import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { ClientDesignReferences } from "@/components/clients/client-design-references";
import { MeasurementsCard } from "@/components/clients/measurements-card";
import { NewOrderDialog } from "@/components/clients/new-order-dialog";
import { OrdersList } from "@/components/clients/orders-list";
import { PaymentsList } from "@/components/clients/payments-list";
import { ProfileCard } from "@/components/clients/profile-card";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClientRequest } from "@/lib/api/clients";
import { getSettingsRequest } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/client";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let client;
  try {
    client = await getClientRequest(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  let settings = {
    whatsappBusinessMobile: null as string | null,
    gstRatePercent: null as number | null,
    gstNumber: null as string | null,
    defaultGarmentRates: {} as Record<string, number>,
    deliveryPresets: [] as number[],
  };
  try {
    settings = await getSettingsRequest();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
  }

  return (
    <>
      <PageHeader
        title={client.fullName}
        description={`Client since ${format(new Date(client.createdAt), "dd MMM yyyy")} · ${client.mobile}`}
        actions={
          <>
            <NewOrderDialog
              clientId={client.id}
              clientName={client.fullName}
              defaultGstRatePercent={settings.gstRatePercent}
              defaultRates={settings.defaultGarmentRates ?? {}}
              deliveryPresets={settings.deliveryPresets ?? []}
            />
            <Link href={`/clients/${client.id}/edit`} className={buttonVariants({ variant: "outline" })}>
              Edit
            </Link>
            <DeleteClientDialog id={client.id} name={client.fullName} />
          </>
        }
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="orders">Orders &amp; Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileCard
            client={client}
            whatsappBusinessMobile={settings.whatsappBusinessMobile}
          />
        </TabsContent>
        <TabsContent value="measurements" className="mt-4 space-y-6">
          <MeasurementsCard client={client} />
          <ClientDesignReferences orders={client.orders} />
        </TabsContent>
        <TabsContent value="orders" className="mt-4 space-y-6">
          <OrdersList
            orders={client.orders}
            clientId={client.id}
            clientName={client.fullName}
            clientMobile={client.mobile}
            gstNumber={settings.gstNumber}
            whatsappBusinessMobile={settings.whatsappBusinessMobile}
          />
          <div>
            <h2 className="mb-3 text-lg font-semibold">Payment history</h2>
            <PaymentsList client={client} />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
