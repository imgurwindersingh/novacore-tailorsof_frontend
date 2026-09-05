import type { SessionUser } from "@/lib/types";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
