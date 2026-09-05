import Link from "next/link";
import { UserX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminNotFound() {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <UserX className="size-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">Nothing here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This client or page no longer exists.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/clients" className={buttonVariants({ variant: "outline" })}>
          All clients
        </Link>
        <Link href="/dashboard" className={buttonVariants()}>
          Dashboard
        </Link>
      </div>
    </Card>
  );
}
