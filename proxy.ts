import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Proxy runs on the Node.js runtime by default (Next.js 16+), which lets
// us import the full Auth.js config — including the Google provider —
// without hitting Vercel's Edge "unsupported modules" check.
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
  // Exclude Next.js internals, the NextAuth handler, and any static asset
  // in /public (anything with an extension we care about). Without this,
  // requests like /zapsign-mark-white.png on the unauthenticated login
  // page get redirected to "/", rendering as broken <img>.
  matcher: [
    "/((?!_next/static|_next/image|api/auth|favicon\\.ico|.+\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|woff|woff2|ttf|otf|mp4|webm)$).*)",
  ],
};
