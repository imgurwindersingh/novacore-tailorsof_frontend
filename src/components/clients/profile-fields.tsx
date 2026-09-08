"use client";

import { Phone, User } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = UseFormReturn<any>;

function message(errors: unknown, key: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = (errors as any)?.[key];
  return typeof node?.message === "string" ? node.message : undefined;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-destructive">{error}</p>;
}

export function ProfileFields({ form }: { form: AnyForm }) {
  const errors = form.formState.errors.profile;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile.fullName">Full name *</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="profile.fullName"
              placeholder="Full name"
              autoFocus
              autoComplete="off"
              className="pl-9"
              aria-invalid={Boolean(message(errors, "fullName"))}
              {...form.register("profile.fullName")}
            />
          </div>
          <FieldError error={message(errors, "fullName")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile.mobile">Mobile number *</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="profile.mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile"
              className="pl-9"
              aria-invalid={Boolean(message(errors, "mobile"))}
              {...form.register("profile.mobile")}
            />
          </div>
          <FieldError error={message(errors, "mobile")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile.notes">Notes</Label>
          <Textarea
            id="profile.notes"
            rows={2}
            placeholder="Preferences, references, anything useful (optional)"
            aria-invalid={Boolean(message(errors, "notes"))}
            {...form.register("profile.notes")}
          />
          <FieldError error={message(errors, "notes")} />
        </div>
      </div>
    </div>
  );
}