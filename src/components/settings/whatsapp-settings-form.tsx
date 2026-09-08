"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { updateWhatsappBusinessAction } from "@/lib/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WhatsAppSettingsForm({ initialValue }: { initialValue: string | null }) {
  const router = useRouter();
  const [mobile, setMobile] = useState(initialValue ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(value: string | null) {
    setError(null);
    setPending(true);
    const result = await updateWhatsappBusinessAction(value);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMobile(result.data.whatsappBusinessMobile ?? "");
    toast.success(
      value
        ? "WhatsApp Business number saved"
        : "WhatsApp Business number removed"
    );
    router.refresh();
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    void save(mobile.trim());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          WhatsApp Business
        </CardTitle>
        <CardDescription>
          Your shop's WhatsApp Business number. It's shown on the share sheet so
          clients know the profile link is sent from your business.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-business-mobile">WhatsApp Business number</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="whatsapp-business-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="pl-9"
                  autoComplete="tel"
                />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Include your country code (e.g. +91 for India). This is the number
              that appears as the sender when you share a client profile.
            </p>
          </div>
          {mobile ? (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => void save(null)}
            >
              Remove number
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}