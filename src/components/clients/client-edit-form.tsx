"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { updateClientAction } from "@/lib/actions/clients.actions";
import type { ClientDetail } from "@/lib/types";
import { updateClientSchema, type UpdateClientInput } from "@/lib/validators/client";
import { MeasurementsFields } from "@/components/clients/measurements-fields";
import { ProfileFields } from "@/components/clients/profile-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormValues = z.input<typeof updateClientSchema>;

function numToStr(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

export function ClientEditForm({ client }: { client: ClientDetail }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues, undefined, UpdateClientInput>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      profile: {
        fullName: client.fullName,
        mobile: client.mobile,
        fatherOrHusband: client.fatherOrHusband ?? "",
        email: client.email ?? "",
        address: client.address ?? "",
        notes: client.notes ?? "",
      },
      measurements: {
        unit:
          client.generalMeasurement?.unit ??
          client.shirtMeasurement?.unit ??
          client.pantMeasurement?.unit ??
          "CM",
        general: { height: numToStr(client.generalMeasurement?.height) },
        shirt: {
          chest: numToStr(client.shirtMeasurement?.chest),
          waist: numToStr(client.shirtMeasurement?.waist),
          shoulderWidth: numToStr(client.shirtMeasurement?.shoulderWidth),
          sleeveLength: numToStr(client.shirtMeasurement?.sleeveLength),
          shirtLength: numToStr(client.shirtMeasurement?.shirtLength),
          neck: numToStr(client.shirtMeasurement?.neck),
          cuff: numToStr(client.shirtMeasurement?.cuff),
        },
        pant: {
          waist: numToStr(client.pantMeasurement?.waist),
          hip: numToStr(client.pantMeasurement?.hip),
          thigh: numToStr(client.pantMeasurement?.thigh),
          knee: numToStr(client.pantMeasurement?.knee),
          bottomOpening: numToStr(client.pantMeasurement?.bottomOpening),
          inseam: numToStr(client.pantMeasurement?.inseam),
        },
      },
    },
  });

  const onSubmit = form.handleSubmit(async (data: UpdateClientInput) => {
    setSubmitError(null);
    const result = await updateClientAction(client.id, data);
    if (!result.ok) {
      setSubmitError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Client updated");
    router.push(`/clients/${client.id}`);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {submitError ? (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileFields form={form as never} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <MeasurementsFields form={form as never} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
