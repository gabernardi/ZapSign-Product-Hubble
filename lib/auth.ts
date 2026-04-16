import NextAuth from "next-auth";
import { CredentialsSignin } from "@auth/core/errors";
import Credentials from "next-auth/providers/credentials";
import { evaluatePasswordAttempt } from "@/lib/password-lockout";

/** Senha vazia no .env não pode derrubar o default (?? não trata ""). */
const SITE_PASSWORD = (() => {
  const raw = process.env.SITE_PASSWORD;
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
  return "1234";
})();

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
          typeof credentials?.password === "string"
            ? credentials.password.trim()
            : "";

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
    /** Só existe login por credenciais; authorize já validou a senha. */
    signIn() {
      return true;
    },
    jwt({ token, user, account }) {
      if (user && (account?.type === "credentials" || account?.provider === "credentials")) {
        token.passwordGate = true;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        passwordGate: token.passwordGate === true,
      };
    },
  },
});

declare module "next-auth" {
  interface Session {
    passwordGate: boolean;
  }
}
