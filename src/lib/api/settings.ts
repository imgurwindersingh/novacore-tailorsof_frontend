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

/** PUT /api/settings/gst — save the default GST rate (%) and GSTIN (null clears a value) */
export async function updateGstSettingsRequest(dto: {
  gstRatePercent: number | null;
  gstNumber: string | null;
}): Promise<ShopSettings> {
  return apiFetch<ShopSettings>("/api/settings/gst", {
    method: "PUT",
    body: dto,
  });
}

export interface GarmentRateEntry {
  garment: string;
  rate: number;
}

/** PUT /api/settings/garment-rates — save the default prices per garment (empty list clears) */
export async function updateGarmentRatesRequest(
  rates: GarmentRateEntry[]
): Promise<ShopSettings> {
  return apiFetch<ShopSettings>("/api/settings/garment-rates", {
    method: "PUT",
    body: { rates },
  });
}

/** PUT /api/settings/delivery-presets — save delivery shortcuts in days (empty clears) */
export async function updateDeliveryPresetsRequest(
  presets: number[]
): Promise<ShopSettings> {
  return apiFetch<ShopSettings>("/api/settings/delivery-presets", {
    method: "PUT",
    body: { presets },
  });
}