"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [justRefreshed, setJustRefreshed] = useState(false);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
    // Brief visual confirmation that the refresh fired
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 1500);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
      aria-label="Refresh profile data"
      className="gap-1.5"
    >
      <RefreshCw
        className={`size-3.5 ${isPending ? "animate-spin" : ""} ${justRefreshed && !isPending ? "text-green-600" : ""}`}
      />
      <span className="hidden sm:inline">
        {isPending ? "Refreshing…" : "Refresh"}
      </span>
    </Button>
  );
}
