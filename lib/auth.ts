import NextAuth from "next-auth";
import type { Provider } from "@auth/core/providers";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const ALLOWED_DOMAIN = "zapsign.com.br";
const IS_DEV = process.env.NODE_ENV === "development";

const providers: Provider[] = [
  Google({
    authorization: {
      params: {
        hd: ALLOWED_DOMAIN,
        prompt: "select_account",
      },
    },
  }),
];

if (IS_DEV) {
  providers.push(
    Credentials({
      id: "dev-bypass",
      name: "Dev Bypass",
      credentials: {},
      authorize() {
        return {
          id: "dev-user",
          name: "Dev User",
          email: "dev@zapsign.com.br",
          image: null,
        };
      },
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider === "dev-bypass") return IS_DEV;
      if (!profile?.email) return false;
      return profile.email.endsWith(`@${ALLOWED_DOMAIN}`);
    },
    session({ session }) {
      return session;
    },
  },
});
