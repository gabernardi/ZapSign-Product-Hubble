"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "./GoogleSignInButton.module.css";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

export function GoogleSignInButton({
  callbackUrl = "/dashboard",
}: GoogleSignInButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={handleClick}
      disabled={pending}
      aria-busy={pending}
    >
      <GoogleMark />
      <span className={styles.label}>
        {pending ? "Redirecionando…" : "Continuar com Google"}
      </span>
    </button>
  );
}

function GoogleMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={styles.mark}
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 7.8-11.3 7.8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 5.9 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16.2 19 13.5 24 13.5c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 7.3 29.3 5 24 5 16 5 9.1 9.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9 39.5 15.9 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-3.9 5.4l6.2 5.2c-.4.4 6.8-4.9 6.8-14.6 0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
