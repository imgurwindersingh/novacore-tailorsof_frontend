"use client";

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="profile.fullName">Full name *</Label>
        <Input id="profile.fullName" aria-invalid={Boolean(message(errors, "fullName"))} {...form.register("profile.fullName")} />
        <FieldError error={message(errors, "fullName")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profile.mobile">Mobile number *</Label>
        <Input id="profile.mobile" type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile" aria-invalid={Boolean(message(errors, "mobile"))} {...form.register("profile.mobile")} />
        <FieldError error={message(errors, "mobile")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profile.fatherOrHusband">Father / husband name</Label>
        <Input id="profile.fatherOrHusband" aria-invalid={Boolean(message(errors, "fatherOrHusband"))} {...form.register("profile.fatherOrHusband")} />
        <FieldError error={message(errors, "fatherOrHusband")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profile.email">Email</Label>
        <Input id="profile.email" type="email" placeholder="optional" aria-invalid={Boolean(message(errors, "email"))} {...form.register("profile.email")} />
        <FieldError error={message(errors, "email")} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="profile.address">Address</Label>
        <Textarea id="profile.address" rows={2} aria-invalid={Boolean(message(errors, "address"))} {...form.register("profile.address")} />
        <FieldError error={message(errors, "address")} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="profile.notes">Notes</Label>
        <Textarea id="profile.notes" rows={2} placeholder="Preferences, references, anything useful" aria-invalid={Boolean(message(errors, "notes"))} {...form.register("profile.notes")} />
        <FieldError error={message(errors, "notes")} />
      </div>
    </div>
  );
}
