import type { NotifyResult } from "../types";
import { apiFetch } from "./client";

/** PATCH /api/orders/:id/deliver */
export async function markOrderDeliveredRequest(
  orderId: string
): Promise<{ orderId: string; clientId: string; notified?: NotifyResult }> {
  return apiFetch<{ orderId: string; clientId: string; notified?: NotifyResult }>(
    `/api/orders/${orderId}/deliver`,
    { method: "PATCH" }
  );
}

/** PATCH /api/orders/:id/revert-delivery */
export async function revertOrderDeliveryRequest(
  orderId: string
): Promise<{ orderId: string; clientId: string }> {
  return apiFetch<{ orderId: string; clientId: string }>(
    `/api/orders/${orderId}/revert-delivery`,
    { method: "PATCH" }
  );
}
