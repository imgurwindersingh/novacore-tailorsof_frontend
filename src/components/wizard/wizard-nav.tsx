"use client";

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WizardNav({
  step,
  steps,
  onBack,
  onNext,
  onConfirm,
  isSubmitting,
}: {
  step: number;
  steps: number;
  onBack: () => void;
  onNext: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  const isLast = step === steps - 1;
  return (
    <div className="flex items-center justify-between gap-3 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting}
        className={step === 0 ? "invisible" : ""}
      >
        <ArrowLeft className="size-4" /> Back
      </Button>
      <span className="text-xs text-muted-foreground sm:hidden">
        Step {step + 1} of {steps}
      </span>
      {isLast ? (
        <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Confirm &amp; Save
        </Button>
      ) : (
        <Button type="button" onClick={onNext} disabled={isSubmitting} className="gap-2">
          Next <ArrowRight className="size-4" />
          <kbd className="hidden rounded border border-current/20 px-1 text-[10px] font-medium opacity-70 sm:inline">
            ↵
          </kbd>
        </Button>
      )}
    </div>
  );
}
