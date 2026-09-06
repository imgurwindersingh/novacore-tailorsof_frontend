/**
 * Core fetch wrapper.
 *
 * Server Components call `apiFetch` directly — it reads the session cookie and
 * forwards the JWT as a Bearer token.
 *
 * 401 handling flow:
 *   1. Original request returns 401
 *   2. Call POST /api/auth/refresh with the refresh token cookie
 *      a. Refresh returns 401  → refresh token is expired/revoked
 *                               → clear both cookies + redirect("/login")
 *      b. Refresh returns any other error / no refresh token exists
 *                               → clear both cookies + redirect("/login")
 *      c. Refresh succeeds     → save new token pair + retry original request
 *         - Retry succeeds     → return response
 *         - Retry returns 401  → clear both cookies + redirect("/login")
 *         - Retry other error  → throw ApiError
 *
 * redirect("/login") throws NEXT_REDIRECT which propagates past userland
 * try/catch blocks and is handled by the Next.js framework directly.
 */
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE, REFRESH_TOKEN_COOKIE } from "../constants";
import { saveSession, clearSession } from "../session";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip attaching the auth token (used for login / refresh endpoints). */
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

type RefreshResult =
  | { ok: true; accessToken: string; refreshToken: string }
  /** Refresh token was rejected by the backend (401) — must force logout. */
  | { ok: false; forceLogout: true }
  /** No refresh token cookie, or a non-401 network/server error. */
  | { ok: false; forceLogout: false };

/**
 * Call POST /api/auth/refresh and return a typed result.
 * Uses raw fetch() to avoid a circular import with auth.ts.
 *
 * - Returns { ok: true, ... }                on success
 * - Returns { ok: false, forceLogout: true }  when the backend returns 401
 *   (refresh token expired / revoked — the user MUST be logged out)
 * - Returns { ok: false, forceLogout: false } for any other failure
 */
async function attemptTokenRefresh(): Promise<RefreshResult> {
  try {
    const store = await cookies();
    const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) return { ok: false, forceLogout: false };

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    // 401 from /refresh means the refresh token itself is expired or revoked.
    // This is a definitive signal to log the user out immediately.
    if (res.status === 401) {
      return { ok: false, forceLogout: true };
    }

    if (!res.ok) return { ok: false, forceLogout: false };

    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (
      typeof data.accessToken !== "string" ||
      typeof data.refreshToken !== "string"
    ) {
      return { ok: false, forceLogout: false };
    }

    return {
      ok: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch {
    return { ok: false, forceLogout: false };
  }
}

/**
 * Clear both session cookies (best-effort — silently skipped when the cookie
 * store is read-only during RSC rendering) then redirect to /login.
 */
async function expireAndRedirect(): Promise<never> {
  try {
    await clearSession();
  } catch {
    // Cookie store is read-only during RSC rendering — that's fine.
    // Middleware will catch the stale token on the next request and redirect.
  }
  redirect("/login");
}

/**
 * Parse a human-readable error message out of a failed fetch Response.
 */
async function parseErrorMessage(res: Response): Promise<string> {
  let message = res.statusText || "Request failed";
  try {
    const json = (await res.json()) as { error?: string; message?: string };
    if (json.message && typeof json.message === "string") {
      message = json.error ? `${json.error}: ${json.message}` : json.message;
    } else if (json.error && typeof json.error === "string") {
      message = json.error;
    }
  } catch {
    // ignore — body may not be JSON
  }
  return message;
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

  const buildHeaders = (token?: string): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // ── First attempt ───────────────────────────────────────────────────────────
  let accessToken: string | undefined;
  if (!unauthenticated) {
    try {
      const store = await cookies();
      accessToken = store.get(SESSION_COOKIE)?.value;
    } catch {
      // Outside a Next.js request context (e.g. build time) — skip
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: buildHeaders(accessToken),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: rest.cache ?? "no-store",
  });

  // ── Success ─────────────────────────────────────────────────────────────────
  if (res.ok) return res.json() as Promise<T>;

  // ── Non-401 error ───────────────────────────────────────────────────────────
  if (res.status !== 401 || unauthenticated) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }

  // ── 401 — attempt token refresh ─────────────────────────────────────────────
  const refreshResult = await attemptTokenRefresh();

  if (!refreshResult.ok) {
    // Whether it was a 401 from /refresh (forceLogout: true) or any other
    // failure, the session cannot be recovered — clear cookies and send the
    // user to /login. NEXT_REDIRECT escapes page-level try/catch blocks.
    return expireAndRedirect();
  }

  // ── Refresh succeeded — persist the new token pair ─────────────────────────
  // saveSession() may be a no-op if cookies are read-only (RSC render context)
  try {
    await saveSession(refreshResult.accessToken, refreshResult.refreshToken);
  } catch {
    // ignore
  }

  // ── Retry the original request once with the new access token ───────────────
  const retryRes = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: buildHeaders(refreshResult.accessToken),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: rest.cache ?? "no-store",
  });

  if (retryRes.ok) return retryRes.json() as Promise<T>;

  // Retry returned 401 → unrecoverable, force logout.
  if (retryRes.status === 401) {
    return expireAndRedirect();
  }

  throw new ApiError(retryRes.status, await parseErrorMessage(retryRes));
}
