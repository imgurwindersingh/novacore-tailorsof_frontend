import { DeliveryPresetsSettingsForm } from "@/components/settings/delivery-presets-settings-form";
import { GarmentRatesSettingsForm } from "@/components/settings/garment-rates-settings-form";
import { GstSettingsForm } from "@/components/settings/gst-settings-form";
import { WhatsAppSettingsForm } from "@/components/settings/whatsapp-settings-form";
import { PageHeader } from "@/components/layout/page-header";
import { getSettingsRequest } from "@/lib/api/settings";
import type { ShopSettings } from "@/lib/types";

export const metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings: ShopSettings = {
    whatsappBusinessMobile: null,
    gstRatePercent: null,
    gstNumber: null,
    defaultGarmentRates: {},
    deliveryPresets: [],
    twilioConfigured: false,
    whatsappEnabled: true,
    twilioFromNumber: null,
    twilioContentSid: null,
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
    console.error("Failed to load settings from backend:", err);
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Shop configuration"
      />
      <div className="space-y-6">
        <GstSettingsForm
          initialRate={settings.gstRatePercent}
          initialNumber={settings.gstNumber}
        />
        <GarmentRatesSettingsForm initialRates={settings.defaultGarmentRates} />
        <DeliveryPresetsSettingsForm initialPresets={settings.deliveryPresets} />
        <WhatsAppSettingsForm initialValue={settings.whatsappBusinessMobile} />
      </div>
    </>
  );
}