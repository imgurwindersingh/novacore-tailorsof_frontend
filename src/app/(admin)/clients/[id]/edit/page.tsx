import { notFound } from "next/navigation";
import { ClientEditForm } from "@/components/clients/client-edit-form";
import { PageHeader } from "@/components/layout/page-header";
import { getClientRequest } from "@/lib/api/clients";
import { ApiError } from "@/lib/api/client";

export const metadata = {
  title: "Edit client",
};

export default async function EditClientPage({
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

  return (
    <>
      <PageHeader
        title={`Edit ${client.fullName}`}
        description="Update profile details and measurements"
      />
      <ClientEditForm client={client} />
    </>
  );
}
