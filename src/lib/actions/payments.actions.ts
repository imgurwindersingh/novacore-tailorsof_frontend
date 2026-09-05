"use server";

import { revalidatePath } from "next/cache";
import { recordPaymentRequest } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import type { PaymentMethod } from "@/lib/types";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function apiErr<T = never>(e: unknown): ServiceResult<T> {
  if (e instanceof ApiError) return { ok: false, error: e.message };
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function recordPaymentAction(
  orderId: string,
  input: { amount: number; method: PaymentMethod; note: string },
  clientId: string
): Promise<ServiceResult<{ duePaise: number }>> {
  try {
    const data = await recordPaymentRequest(orderId, input);
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}
