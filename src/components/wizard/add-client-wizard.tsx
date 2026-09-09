"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClientWithOrderAction, checkMobileExistsAction } from "@/lib/actions/clients.actions";
import {
  addClientWizardSchema,
  type AddClientWizardInput,
} from "@/lib/validators/client";
import { MeasurementsFields } from "@/components/clients/measurements-fields";
import { ProfileFields } from "@/components/clients/profile-fields";
import { Card, CardContent } from "@/components/ui/card";
import { datePlusDays } from "@/lib/dates";
import { StepOrdersPayment } from "./step-orders-payment";
import { StepReview } from "./step-review";
import { WizardNav } from "./wizard-nav";
import { WIZARD_STEPS, WizardStepper } from "./wizard-stepper";

type WizardFormValues = z.input<typeof addClientWizardSchema>;

const STEP_FIELDS = ["profile", "measurements", "order"] as const;

export function AddClientWizard({
  defaultGstRatePercent = null,
  defaultGarmentRates = {},
  deliveryPresets = [],
}: {
  defaultGstRatePercent?: number | null;
  defaultGarmentRates?: Record<string, number>;
  deliveryPresets?: number[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<WizardFormValues, undefined, AddClientWizardInput>({
    resolver: zodResolver(addClientWizardSchema),
    defaultValues: {
      profile: {
        fullName: "",
        mobile: "",
        notes: "",
      },
      measurements: {
        unit: "CM",
        general: { height: "" },
        shirt: {
          chest: "",
          waist: "",
          shoulderWidth: "",
          sleeveLength: "",
          shirtLength: "",
          neck: "",
          cuff: "",
        },
        pant: {
          waist: "",
          hip: "",
          thigh: "",
          knee: "",
          bottomOpening: "",
          inseam: "",
        },
      },
      order: {
        items: [],
        expectedDelivery: deliveryPresets[0] ? datePlusDays(deliveryPresets[0]) : "",
        advance: 0,
        paymentMethod: "",
        gstRatePercent: defaultGstRatePercent ?? 0,
      },
    },
  });

  async function goToStep(target: number) {
    if (target <= step) {
      setStep(target);
      return;
    }
    for (let s = step; s < target; s++) {
      const valid = await form.trigger(STEP_FIELDS[s]);
      if (!valid) {
        setStep(s);
        return;
      }
    }
    // Check for duplicate mobile before leaving the profile step
    if (step === 0 && target > 0) {
      const mobile = form.getValues("profile.mobile");
      if (mobile && mobile.trim().length === 10) {
        setServerError(null);
        const result = await checkMobileExistsAction(mobile);
        if (result.ok && result.data.exists) {
          form.setError("profile.mobile", {
            message: "A client with this mobile number already exists",
          });
          setServerError("A client with this mobile number already exists");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
    }
    setStep(target);
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fast data entry: pressing Enter in a text input advances to the next step.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") return;
      const target = event.target as HTMLElement | null;
      if (!target || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) {
        return;
      }
      if (target instanceof HTMLInputElement && target.type !== "text" && target.type !== "tel") {
        return;
      }
      event.preventDefault();
      if (step < WIZARD_STEPS.length - 1) void goToStep(step + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  async function confirm() {
    setIsSubmitting(true);
    setServerError(null);

    await form.handleSubmit(
      async (data) => {
        try {
          const result = await createClientWithOrderAction(data);
          if (!result.ok) {
            setServerError(result.error);
            toast.error(result.error || "Failed to save client");
            setIsSubmitting(false);
            // If it's a duplicate mobile error, jump back to the profile step
            // and set the field error so the user knows exactly what to fix.
            if (result.error?.toLowerCase().includes("mobile")) {
              form.setError("profile.mobile", { message: result.error });
              setStep(0);
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          toast.success(`Client saved · Order ${result.data.orderNumber} created`);
          const notified = result.data.notified;
          if (notified?.channel === "whatsapp" && notified.ok) {
            toast.success("WhatsApp message sent to client");
          } else if (notified?.channel === "sms" && notified.ok) {
            toast.success("SMS sent to client");
          } else if (notified?.channel === "none") {
            toast.info("No SMS/WhatsApp configured on this server yet");
          } else if (notified && !notified.ok) {
            toast.error(notified.error ?? "Message couldn't be sent");
          }
          router.push(`/clients/${result.data.clientId}`);
          router.refresh();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred";
          setServerError(msg);
          toast.error(msg);
          setIsSubmitting(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      (errors) => {
        setIsSubmitting(false);
        toast.error("Please fill in all required fields before confirming.");
        if (errors.profile) setStep(0);
        else if (errors.measurements) setStep(1);
        else if (errors.order) setStep(2);
      }
    )();
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <WizardStepper current={step} onStepClick={(i) => void goToStep(i)} />

        {serverError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Failed to save client</p>
              <p className="text-xs">{serverError}</p>
            </div>
          </div>
        ) : null}

        {step === 0 ? <ProfileFields form={form as never} /> : null}
        {step === 1 ? <MeasurementsFields form={form as never} /> : null}
        {step === 2 ? (
          <StepOrdersPayment
            form={form as never}
            defaultRates={defaultGarmentRates}
            deliveryPresets={deliveryPresets}
          />
        ) : null}
        {step === 3 ? (
          <StepReview form={form as never} onEdit={(s) => setStep(s)} />
        ) : null}

        <WizardNav
          step={step}
          steps={WIZARD_STEPS.length}
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onNext={() => void goToStep(step + 1)}
          onConfirm={confirm}
          isSubmitting={isSubmitting || form.formState.isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
