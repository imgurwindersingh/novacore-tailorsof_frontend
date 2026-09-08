import { WhatsAppSettingsForm } from "@/components/settings/whatsapp-settings-form";
import { PageHeader } from "@/components/layout/page-header";
import { getSettingsRequest } from "@/lib/api/settings";
import type { ShopSettings } from "@/lib/types";

export const metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings: ShopSettings = { whatsappBusinessMobile: null };

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
        <WhatsAppSettingsForm initialValue={settings.whatsappBusinessMobile} />
      </div>
    </>
  );
}