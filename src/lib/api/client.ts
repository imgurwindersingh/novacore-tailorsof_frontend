/**
 * Core fetch wrapper.
 *
 * Server Components call `apiFetch` directly — it reads the session cookie and
 * forwards the JWT as a Bearer token.
 *
 * Client Components / Server Actions use the higher-level helpers in the
 * sibling files (auth.ts, clients.ts, etc.) which call `apiFetch` internally.
 */
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "../constants";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip attaching the auth token (used for the login endpoint). */
  unauthenticated?: boolean;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Make an authenticated request to the backend API.
 * Can be called from Server Components, Server Actions, and Route Handlers.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, unauthenticated, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> | undefined),
  };

  if (!unauthenticated) {
    // `cookies()` is available in Server Components / Server Actions
    try {
      const store = await cookies();
      const token = store.get(SESSION_COOKIE)?.value;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // Running outside a Next.js request context (e.g. build time) — skip
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Opt out of Next.js default caching for data that changes often
    cache: rest.cache ?? "no-store",
  });

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const json = (await res.json()) as { error?: string; message?: string };
      if (json.message && typeof json.message === "string") {
        message = json.error ? `${json.error}: ${json.message}` : json.message;
      } else if (json.error && typeof json.error === "string") {
        message = json.error;
      }
    } catch {
      // ignore
    }

    if (res.status === 401 && !unauthenticated) {
      try {
        const store = await cookies();
        store.delete(SESSION_COOKIE);
      } catch {
        // ignore if read-only context (e.g. server component render)
      }
      message = "Your session has expired or is invalid. Please sign in again.";
    }

    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
