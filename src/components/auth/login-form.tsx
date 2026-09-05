"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { doLogin, type ActionResult } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    doLogin,
    null
  );

  return (
    <form action={formAction} className="space-y-4" noValidate={false}>
      {state && !state.ok && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@tailorsoft.dev"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        Sign in
      </Button>
    </form>
  );
}
