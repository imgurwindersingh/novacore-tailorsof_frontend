"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  GENERAL_MEASUREMENT_LABELS,
  PANT_MEASUREMENT_LABELS,
  SHIRT_MEASUREMENT_LABELS,
  UNITS,
} from "@/lib/constants";
import type { Unit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SHIRT_FIELDS = [
  "chest",
  "waist",
  "shoulderWidth",
  "sleeveLength",
  "shirtLength",
  "neck",
  "cuff",
] as const;

const PANT_FIELDS = ["waist", "hip", "thigh", "knee", "bottomOpening", "inseam"] as const;

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function roundForUnit(value: number, unit: Unit) {
  return roundTo(value, unit === "INCH" ? 2 : 1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = UseFormReturn<any>;

function errorAt(errors: unknown, path: string): string | undefined {
  const node = path
    .split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce<any>((acc, key) => (acc == null ? acc : acc[key]), errors);
  return typeof node?.message === "string" ? node.message : undefined;
}

function MeasureInput({
  form,
  path,
  label,
}: {
  form: AnyForm;
  path: string;
  label: string;
}) {
  const error = errorAt(form.formState.errors, path);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        aria-invalid={Boolean(error)}
        {...form.register(path)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function MeasurementsFields({ form }: { form: AnyForm }) {
  const unit: Unit = form.watch("measurements.unit") ?? "CM";

  function changeUnit(next: Unit) {
    if (next === unit) return;
    const factor = next === "INCH" ? 1 / 2.54 : 2.54;
    const paths = [
      "measurements.general.height",
      ...SHIRT_FIELDS.map((field) => `measurements.shirt.${field}`),
      ...PANT_FIELDS.map((field) => `measurements.pant.${field}`),
    ];
    for (const path of paths) {
      const raw = form.getValues(path);
      const num = typeof raw === "number" ? raw : raw === "" || raw == null ? null : Number(raw);
      if (num != null && Number.isFinite(num)) {
        form.setValue(path, String(roundForUnit(num * factor, next)));
      }
    }
    form.setValue("measurements.unit", next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>Unit</Label>
        <Select value={unit} onValueChange={(value) => changeUnit((value ?? "CM") as Unit)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u} value={u}>
                {u === "CM" ? "Centimetres" : "Inches"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Entered values are converted when you switch.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MeasureInput form={form} path="measurements.general.height" label={GENERAL_MEASUREMENT_LABELS.height} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shirt / Kurta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SHIRT_FIELDS.map((field) => (
            <MeasureInput
              key={field}
              form={form}
              path={`measurements.shirt.${field}`}
              label={SHIRT_MEASUREMENT_LABELS[field]}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pant / Trouser</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PANT_FIELDS.map((field) => (
            <MeasureInput
              key={field}
              form={form}
              path={`measurements.pant.${field}`}
              label={PANT_MEASUREMENT_LABELS[field]}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
