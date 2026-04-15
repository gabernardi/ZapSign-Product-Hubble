"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./PasswordLoginForm.module.css";

function messageForCode(code: string | undefined): string {
  if (code === "locked_out") {
    return "Muitas tentativas incorretas. Acesso bloqueado por 30 minutos.";
  }
  if (code === "invalid_credentials") {
    return "Senha incorreta.";
  }
  return "Não foi possível entrar. Tente novamente.";
}

export function PasswordLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const password = new FormData(form).get("password");
    if (typeof password !== "string") return;

    startTransition(async () => {
      const result = await signIn("credentials", {
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.ok && !result.error) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setError(messageForCode(result?.code));
      form.reset();
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.label} htmlFor="site-password">
        Senha de acesso
      </label>
      <input
        id="site-password"
        name="password"
        type="password"
        className={styles.input}
        autoComplete="current-password"
        required
        disabled={pending}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "login-error" : undefined}
      />
      {error ? (
        <p id="login-error" className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
