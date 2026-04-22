import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Runs on Node runtime so it can import the full Auth.js config (including
// the Google provider) without triggering Vercel's "unsupported modules"
// check in the Edge Runtime.
export const runtime = "nodejs";

export default auth((req) => {
  const isAuthenticated = Boolean(req.auth?.user);
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isLoginPage = req.nextUrl.pathname === "/";

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
