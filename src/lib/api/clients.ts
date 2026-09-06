import type {
  ClientDetail,
  ClientListResult,
  CreateClientInput,
  PublicClientProfile,
  UpdateClientInput,
  WizardOrderInput,
} from "../types";
import { apiFetch } from "./client";

/** GET /api/clients?q=&page= */
export async function listClientsRequest(args: {
  q?: string;
  page?: number;
}): Promise<ClientListResult> {
  const params = new URLSearchParams();
  if (args.q) params.set("q", args.q);
  if (args.page) params.set("page", String(args.page));
  const qs = params.toString();
  return apiFetch<ClientListResult>(`/api/clients${qs ? `?${qs}` : ""}`);
}

/** GET /api/clients/:id */
export async function getClientRequest(id: string): Promise<ClientDetail> {
  return apiFetch<ClientDetail>(`/api/clients/${id}`);
}

/** POST /api/clients */
export async function createClientRequest(
  input: CreateClientInput
): Promise<{ clientId: string; orderId: string; orderNumber: string }> {
  return apiFetch<{ clientId: string; orderId: string; orderNumber: string }>(
    "/api/clients",
    { method: "POST", body: input }
  );
}

/** PUT /api/clients/:id */
export async function updateClientRequest(
  id: string,
  input: UpdateClientInput
): Promise<{ clientId: string }> {
  return apiFetch<{ clientId: string }>(`/api/clients/${id}`, {
    method: "PUT",
    body: input,
  });
}

/** DELETE /api/clients/:id */
export async function deleteClientRequest(
  id: string
): Promise<{ clientId: string }> {
  return apiFetch<{ clientId: string }>(`/api/clients/${id}`, {
    method: "DELETE",
  });
}

/** POST /api/clients/:clientId/orders — add a new order to an existing client */
export async function createOrderForClientRequest(
  clientId: string,
  input: WizardOrderInput
): Promise<{ orderId: string; orderNumber: string; clientId: string }> {
  return apiFetch<{ orderId: string; orderNumber: string; clientId: string }>(
    `/api/clients/${clientId}/orders`,
    { method: "POST", body: input }
  );
}

/** GET /api/public/clients/:id — no auth required */
export async function getPublicClientRequest(id: string): Promise<PublicClientProfile> {
  return apiFetch<PublicClientProfile>(`/api/public/clients/${id}`, {
    unauthenticated: true,
  });
}
