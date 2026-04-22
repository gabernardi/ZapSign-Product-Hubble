import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return (ALLOWED_DOMAINS as readonly string[]).includes(domain);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn({ account, profile, user }) {
      if (account?.provider !== "google") return false;
      const email =
        (profile as { email?: string } | undefined)?.email ??
        user?.email ??
        null;
      return isAllowedEmail(email);
    },
  },
});
