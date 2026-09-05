import type { ClientRow, DashboardStats, UpcomingDelivery } from "../types";
import { apiFetch } from "./client";

/** GET /api/dashboard/stats */
export async function getDashboardStatsRequest(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/dashboard/stats");
}

/** GET /api/dashboard/recent-clients?limit= */
export async function getRecentClientsRequest(limit = 5): Promise<ClientRow[]> {
  return apiFetch<ClientRow[]>(`/api/dashboard/recent-clients?limit=${limit}`);
}

/** GET /api/dashboard/upcoming-deliveries?limit= */
export async function getUpcomingDeliveriesRequest(
  limit = 10
): Promise<UpcomingDelivery[]> {
  return apiFetch<UpcomingDelivery[]>(
    `/api/dashboard/upcoming-deliveries?limit=${limit}`
  );
}
