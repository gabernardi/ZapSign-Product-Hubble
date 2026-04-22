import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Uses the edge-safe slice of the Auth.js config so this middleware can
// run on the Edge Runtime (required by Vercel). The Google provider and
// anything that performs OAuth network calls lives in `lib/auth.ts`.
const { auth } = NextAuth(authConfig);

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
