"use client";

import { useState } from "react";
import { Share2, Check, Copy, MessageCircle, Send, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareProfileButtonProps {
  clientId: string;
  clientMobile?: string;
  clientName?: string;
  whatsappBusinessMobile?: string | null;
}

function waDigits(number: string): string {
  return number.replace(/[^0-9]/g, "");
}

export function ShareProfileButton({
  clientId,
  clientMobile,
  clientName,
  whatsappBusinessMobile,
}: ShareProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState(clientMobile ?? "");
  const [copied, setCopied] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${clientId}`
      : `/p/${clientId}`;

  const message = clientName
    ? `Hi ${clientName}, here is your profile link at Unique Tailors:\n${profileUrl}\n\nFor any changes, just reply to this WhatsApp.`
    : `Here is your profile link at Unique Tailors:\n${profileUrl}`;

  function openDialog() {
    setNumber(clientMobile ?? "");
    setOpen(true);
  }

  function sendOnWhatsApp() {
    const digits = waDigits(number);
    if (!digits) {
      toast.error("Enter a valid WhatsApp number");
      return;
    }
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link — please copy it manually: " + profileUrl);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" aria-label="Share client profile link">
            <Share2 className="size-4" />
            Share profile
          </Button>
        }
        onClick={openDialog}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share profile on WhatsApp</DialogTitle>
          <DialogDescription>
            {clientName
              ? `Send ${clientName}'s profile link to their WhatsApp.`
              : "Send the client's profile link to their WhatsApp."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-whatsapp-number">Client's WhatsApp number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="share-whatsapp-number"
                type="tel"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="pl-9"
                autoComplete="tel"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Include the country code (e.g. +91 for India) so WhatsApp can reach
              the client.
            </p>
          </div>

          {whatsappBusinessMobile ? (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <MessageCircle className="size-3.5 shrink-0 text-primary" />
              Sent from WhatsApp Business <span className="font-medium text-foreground">{whatsappBusinessMobile}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <MessageCircle className="size-3.5 shrink-0" />
              Set your WhatsApp Business number in Settings to label outgoing shares.
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Message preview</p>
            <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              {message}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={copyLink}>
            {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button type="button" onClick={sendOnWhatsApp}>
            <Send className="size-4" />
            Send on WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}