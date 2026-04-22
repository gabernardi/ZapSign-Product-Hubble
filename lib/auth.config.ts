import type { NextAuthConfig } from "next-auth";

// Edge-safe slice of the Auth.js config. Kept free of providers that
// fetch over the network so it can be imported by `middleware.ts`, which
// runs on the Edge Runtime. The real providers live in `lib/auth.ts`.
export const authConfig = {
  pages: {
    signIn: "/",
    error: "/",
  },
  trustHost: true,
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (token?.email && typeof token.email === "string" && session.user) {
        session.user.email = token.email;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
