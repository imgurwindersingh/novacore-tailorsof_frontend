"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, LogOut, Menu, Settings, UserPlus, Users } from "lucide-react";
import { doLogout } from "@/lib/actions/auth.actions";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/clients/new", label: "Add Client", icon: UserPlus },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(href: string, pathname: string) {
  if (href === "/clients") {
    return pathname === "/clients" || pathname.startsWith("/clients/");
  }
  return pathname === href;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href, pathname)
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function UserBlock({ user }: { user: SessionUser }) {
  return (
    <div className="flex items-center gap-3 border-t border-sidebar-border px-3 py-4">
      <Avatar className="size-9">
        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
        <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
      </div>
      <form action={doLogout}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Log out" className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3 py-5">
      <Image
        src="/logo.png"
        alt="Bluestar Tailors"
        width={36}
        height={36}
        style={{ width: "auto", height: "36px" }}
        className="shrink-0 object-contain"
        priority
      />
      <div className="min-w-0 leading-tight">
        <span className="block truncate text-lg font-semibold tracking-tight text-sidebar-foreground">
          Bluestar Tailors
        </span>
        <span className="block truncate text-[11px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/50">
          Atelier
        </span>
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <Brand />
        <div className="flex-1 px-3">
          <NavLinks pathname={pathname} />
        </div>
        <UserBlock user={user} />
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Bluestar Tailors"
            width={32}
            height={32}
            style={{ width: "auto", height: "32px" }}
            className="shrink-0 object-contain"
            priority
          />
          <span className="font-semibold text-sidebar-foreground">Bluestar Tailors</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" className="text-sidebar-foreground/80" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="flex w-64 flex-col border-sidebar-border bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand />
            <div className="flex-1 px-3">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <UserBlock user={user} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="h-12 md:hidden" />
    </>
  );
}
