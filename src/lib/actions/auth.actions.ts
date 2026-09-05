"use server";

import { redirect } from "next/navigation";
import { loginRequest } from "@/lib/api/auth";
import { saveSession, clearSession } from "@/lib/session";
import { ApiError } from "@/lib/api/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function doLogin(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email) return { ok: false, error: "Email is required" };
  if (!password) return { ok: false, error: "Password is required" };

  try {
    const { token } = await loginRequest(email, password);
    await saveSession(token);
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function doLogout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
