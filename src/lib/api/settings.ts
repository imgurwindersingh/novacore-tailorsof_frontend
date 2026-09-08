import type { ShopSettings } from "../types";
import { apiFetch } from "./client";

/** GET /api/settings — shop configuration */
export async function getSettingsRequest(): Promise<ShopSettings> {
  return apiFetch<ShopSettings>("/api/settings");
}

/** PUT /api/settings/whatsapp-business — save (or clear with null) the admin WhatsApp Business number */
export async function updateWhatsappBusinessRequest(
  mobile: string | null
): Promise<ShopSettings> {
  return apiFetch<ShopSettings>("/api/settings/whatsapp-business", {
    method: "PUT",
    body: { mobile },
  });
}