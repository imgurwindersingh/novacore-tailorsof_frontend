import { PageHeader } from "@/components/layout/page-header";
import { AddClientWizard } from "@/components/wizard/add-client-wizard";
import { getSettingsRequest } from "@/lib/api/settings";

export const metadata = { title: "Add Client" };

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  let settings = {
    gstRatePercent: null as number | null,
    defaultGarmentRates: {} as Record<string, number>,
    deliveryPresets: [] as number[],
  };
  try {
    settings = await getSettingsRequest();
  } catch (err) {
    if (
      err instanceof Error &&
      (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("Failed to load settings:", err);
  }

  return (
    <div>
      <PageHeader
        title="Add Client"
        description="Profile, measurements, and first order in four steps. Nothing is saved until you confirm."
      />
      <AddClientWizard
        defaultGstRatePercent={settings.gstRatePercent}
        defaultGarmentRates={settings.defaultGarmentRates ?? {}}
        deliveryPresets={settings.deliveryPresets ?? []}
      />
    </div>
  );
}
