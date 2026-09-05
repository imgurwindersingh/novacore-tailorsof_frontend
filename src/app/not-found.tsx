import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you were looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" className={buttonVariants()}>
        Back to dashboard
      </Link>
    </div>
  );
}
