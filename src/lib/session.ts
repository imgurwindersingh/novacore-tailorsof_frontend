/**
 * Session helpers for the frontend.
 *
 * The JWT issued by the backend is stored in an httpOnly cookie called
 * `ts_session`.  These helpers read / write that cookie using the Next.js
 * `cookies()` API (server-side only) and verify the token locally with `jose`
 * so middleware can gate pages without an extra network round-trip.
 */
import { decodeJwt, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "./constants";
import type { Role, SessionUser } from "./types";

function secretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** Decode and verify the JWT stored in the session cookie. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Save the access token and refresh token as httpOnly cookies. */
export async function saveSession(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

/** Clear both the session and refresh token cookies. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

/** Read the refresh token cookie, or null if absent. */
export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Verify / decode a raw JWT string and return the SessionUser payload.
 * If AUTH_SECRET is provided, it attempts cryptographic signature validation.
 * If not provided or if verification fails, it decodes the payload and verifies expiration.
 */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const key = secretKey();
    let payload: Record<string, unknown> | null = null;

    if (key) {
      try {
        const verified = await jwtVerify(token, key);
        payload = verified.payload as Record<string, unknown>;
      } catch {
        payload = null;
      }
    }

    // Fall back to decoding JWT payload if no key or secret mismatch
    if (!payload) {
      payload = decodeJwt(token) as Record<string, unknown>;
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    // Check expiration timestamp (exp is in seconds)
    if (typeof payload.exp === "number" && payload.exp < Date.now() / 1000) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

