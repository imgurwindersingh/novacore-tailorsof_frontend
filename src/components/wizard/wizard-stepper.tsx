"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { title: "Profile", description: "Client details" },
  { title: "Measurements", description: "Body sizes" },
  { title: "Orders & Payment", description: "Garments and advance" },
  { title: "Review", description: "Confirm and save" },
] as const;

export function WizardStepper({
  current,
  onStepClick,
}: {
  current: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto sm:gap-2">
      {WIZARD_STEPS.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        return (
          <li key={step.title} className="flex flex-1 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onStepClick(index)}
              disabled={index > current}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors sm:px-2",
                isDone && "hover:bg-muted",
                !isDone && !isCurrent && "cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary ring-3 ring-primary/15",
                  !isDone && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                {isDone ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span
                  className={cn(
                    "block truncate text-sm font-medium",
                    !isDone && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </button>
            {index < WIZARD_STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px w-3 shrink-0 sm:flex-1",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
