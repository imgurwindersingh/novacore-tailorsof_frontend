import type { PaymentMethod } from "../types";
import { apiFetch } from "./client";

/** POST /api/payments/orders/:orderId */
export async function recordPaymentRequest(
  orderId: string,
  input: { amount: number; method: PaymentMethod; note: string }
): Promise<{ duePaise: number }> {
  return apiFetch<{ duePaise: number }>(`/api/payments/orders/${orderId}`, {
    method: "POST",
    body: input,
  });
}

/** GET /api/payments/clients/:clientId */
export async function listPaymentsByClientRequest(clientId: string): Promise<
  {
    id: string;
    amountPaise: number;
    method: PaymentMethod;
    note: string | null;
    paidAt: string;
    orderNumber: string;
  }[]
> {
  return apiFetch(`/api/payments/clients/${clientId}`);
}
