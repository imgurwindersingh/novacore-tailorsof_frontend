"use server";

import { revalidatePath } from "next/cache";
import {
  checkMobileRequest,
  createClientRequest,
  deleteClientRequest,
  updateClientRequest,
} from "@/lib/api/clients";
import { ApiError } from "@/lib/api/client";
import type { CreateClientInput, UpdateClientInput } from "@/lib/types";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function apiErr<T = never>(e: unknown): ServiceResult<T> {
  console.error("Client action error:", e);
  if (e instanceof ApiError) return { ok: false, error: e.message };
  if (e instanceof Error) return { ok: false, error: e.message };
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function checkMobileExistsAction(
  mobile: string
): Promise<ServiceResult<{ exists: boolean; fullName: string | null }>> {
  try {
    const data = await checkMobileRequest(mobile);
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}

export async function createClientWithOrderAction(
  input: CreateClientInput
): Promise<ServiceResult<{ clientId: string; orderNumber: string }>> {
  try {
    const data = await createClientRequest(input);
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}

export async function updateClientAction(
  id: string,
  input: UpdateClientInput
): Promise<ServiceResult<{ clientId: string }>> {
  try {
    const data = await updateClientRequest(id, input);
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}

export async function deleteClientAction(
  id: string
): Promise<ServiceResult<{ clientId: string }>> {
  try {
    const data = await deleteClientRequest(id);
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (e) {
    return apiErr(e);
  }
}
