"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  GENERAL_MEASUREMENT_LABELS,
  PANT_MEASUREMENT_LABELS,
  SHIRT_MEASUREMENT_LABELS,
} from "@/lib/constants";
import type { PublicClientProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MeasurementGroup({
  title,
  unit,
  values,
  labels,
}: {
  title: string;
  unit: string;
  values: Record<string, number | null>;
  labels: Record<string, string>;
}) {
  const entries = Object.entries(values).filter(([, v]) => v != null);
  if (entries.length === 0) return null;
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="secondary">{unit}</Badge>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs text-muted-foreground">{labels[key] ?? key}</dt>
              <dd className="text-sm font-medium">
                {value} {unit.toLowerCase()}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export function PublicMeasurementsSection({
  client,
}: {
  client: PublicClientProfile;
}) {
  const hasAny =
    client.generalMeasurement ||
    client.shirtMeasurement ||
    client.pantMeasurement;

  const [expanded, setExpanded] = useState(false);

  if (!hasAny) return null;

  return (
    <section>
      {/* Section header with show/hide on the right */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Measurements</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide measurements" : "Show measurements"}
          className="gap-1 text-xs"
        >
          {expanded ? (
            <>Hide <ChevronUp className="size-3.5" /></>
          ) : (
            <>Show <ChevronDown className="size-3.5" /></>
          )}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {client.generalMeasurement ? (
            <MeasurementGroup
              title="General"
              unit={client.generalMeasurement.unit}
              values={{ height: client.generalMeasurement.height }}
              labels={GENERAL_MEASUREMENT_LABELS}
            />
          ) : null}
          {client.shirtMeasurement ? (
            <MeasurementGroup
              title="Shirt / Kurta"
              unit={client.shirtMeasurement.unit}
              values={{
                chest: client.shirtMeasurement.chest,
                waist: client.shirtMeasurement.waist,
                shoulderWidth: client.shirtMeasurement.shoulderWidth,
                sleeveLength: client.shirtMeasurement.sleeveLength,
                shirtLength: client.shirtMeasurement.shirtLength,
                neck: client.shirtMeasurement.neck,
                cuff: client.shirtMeasurement.cuff,
              }}
              labels={SHIRT_MEASUREMENT_LABELS}
            />
          ) : null}
          {client.pantMeasurement ? (
            <MeasurementGroup
              title="Pant / Trouser"
              unit={client.pantMeasurement.unit}
              values={{
                waist: client.pantMeasurement.waist,
                hip: client.pantMeasurement.hip,
                thigh: client.pantMeasurement.thigh,
                knee: client.pantMeasurement.knee,
                bottomOpening: client.pantMeasurement.bottomOpening,
                inseam: client.pantMeasurement.inseam,
              }}
              labels={PANT_MEASUREMENT_LABELS}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
