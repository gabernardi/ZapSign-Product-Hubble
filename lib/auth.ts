import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { evaluatePasswordAttempt } from "@/lib/password-lockout";

const SITE_PASSWORD = process.env.SITE_PASSWORD ?? "1234";

class LockedOutError extends CredentialsSignin {
  code = "locked_out";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Senha do site",
      credentials: {
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        const expected = SITE_PASSWORD;
        const passwordOk = password.length > 0 && password === expected;
        const outcome = evaluatePasswordAttempt(request, passwordOk);

        if (outcome === "locked") {
          throw new LockedOutError();
        }
        if (outcome === "invalid") {
          throw new InvalidCredentialsError();
        }

        return {
          id: "site-access",
          name: "Acesso Product Guidelines",
          email: "product-guidelines@zapsign.com.br",
          image: null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  trustHost: true,
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "credentials") return true;
      return false;
    },
    session({ session }) {
      return session;
    },
  },
});
