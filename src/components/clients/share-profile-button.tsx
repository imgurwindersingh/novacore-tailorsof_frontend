"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareProfileButton({ clientId }: { clientId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/p/${clientId}`;

    // Use Web Share API on mobile if available, otherwise copy to clipboard
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Client Profile",
          text: "View your order and measurement details",
          url,
        });
        return;
      } catch {
        // User cancelled share or it failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without HTTPS
      toast.error("Could not copy link — please copy it manually: " + url);
    }
  }

  return (
    <Button variant="outline" onClick={handleShare} aria-label="Share client profile link">
      {copied ? (
        <Check className="size-4 text-green-600" />
      ) : (
        <Share2 className="size-4" />
      )}
      {copied ? "Copied!" : "Share profile"}
    </Button>
  );
}
