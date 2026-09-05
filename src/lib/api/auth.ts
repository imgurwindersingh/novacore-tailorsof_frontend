import type { SessionUser } from "../types";
import { apiFetch } from "./client";

export interface LoginResponse {
  token: string;
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

/** GET /api/auth/me */
export async function getMeRequest(): Promise<{ user: SessionUser }> {
  return apiFetch<{ user: SessionUser }>("/api/auth/me");
}
