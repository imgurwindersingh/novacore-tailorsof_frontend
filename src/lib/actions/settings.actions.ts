"use server";

import { revalidatePath } from "next/cache";
import { updateWhatsappBusinessRequest } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/client";
import type { ShopSettings } from "@/lib/types";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateWhatsappBusinessAction(
  mobile: string | null
): Promise<ServiceResult<ShopSettings>> {
  try {
    const data = await updateWhatsappBusinessRequest(mobile);
    revalidatePath("/settings");
    return { ok: true, data };
  } catch (e) {
    console.error("Settings action error:", e);
    if (e instanceof ApiError) return { ok: false, error: e.message };
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}