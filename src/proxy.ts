import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public share profile pages — always allow, no auth check
  if (pathname.startsWith("/p/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;

  // Unauthenticated: allow login page, redirect everything else
  if (!user) {
    if (pathname === "/login") return NextResponse.next();
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated: redirect away from login
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
