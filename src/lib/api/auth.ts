import type { SessionUser } from "../types";
import { apiFetch } from "./client";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

/** POST /api/auth/login */
export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    unauthenticated: true,
  });
}

/**
 * POST /api/auth/refresh
 * Exchanges an existing refresh token for a new access + refresh token pair.
 * The old refresh token is invalidated on the backend (rotation).
 */
export async function refreshTokenRequest(
  refreshToken: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    unauthenticated: true,
  });
}

/**
 * POST /api/auth/logout
 * Invalidates the refresh token on the backend.
 */
export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiFetch<{ ok: true }>("/api/auth/logout", {
    method: "POST",
    body: { refreshToken },
    unauthenticated: true,
  });
}

/** GET /api/auth/me */
export async function getMeRequest(): Promise<{ user: SessionUser }> {
  return apiFetch<{ user: SessionUser }>("/api/auth/me");
}
