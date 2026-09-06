"use server";

import { revalidatePath } from "next/cache";
import {
  markOrderDeliveredRequest,
  revertOrderDeliveryRequest,
} from "@/lib/api/orders";
import { createOrderForClientRequest } from "@/lib/api/clients";
import { ApiError } from "@/lib/api/client";
import type { WizardOrderInput } from "@/lib/types";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function apiErr<T = never>(e: unknown): ServiceResult<T> {
  if (e instanceof ApiError) return { ok: false, error: e.message };
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function markOrderDeliveredAction(
  orderId: string
): Promise<ServiceResult<{ orderId: string; clientId: string }>> {
  try {
    const data = await markOrderDeliveredRequest(orderId);
    revalidatePath(`/clients/${data.clientId}`);
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}

export async function revertOrderDeliveryAction(
  orderId: string
): Promise<ServiceResult<{ orderId: string; clientId: string }>> {
  try {
    const data = await revertOrderDeliveryRequest(orderId);
    revalidatePath(`/clients/${data.clientId}`);
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}

export async function createOrderForClientAction(
  clientId: string,
  input: WizardOrderInput
): Promise<ServiceResult<{ orderId: string; orderNumber: string }>> {
  try {
    const data = await createOrderForClientRequest(clientId, input);
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}
