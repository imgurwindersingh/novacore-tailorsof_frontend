"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  const is500 = error.message?.includes("500") || error.message?.includes("Internal server error");

  return (
    <div className="mx-auto max-w-xl py-12">
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Failed to load data</CardTitle>
              <CardDescription>
                {error.message || "An unexpected error occurred while communicating with the backend API."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {is500 && (
            <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <p className="font-semibold mb-1">Backend Connection Note</p>
              <p>
                The backend returned a 500 error. If you are pointing to the Cloudflare Worker URL, please ensure the database is connected or switch to your active local backend (<code className="font-mono">http://localhost:3001</code>).
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={() => reset()} variant="default" className="gap-2">
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
              <LayoutDashboard className="size-4 mr-2" />
              Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
