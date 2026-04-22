"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme, type ThemePreference } from "@/components/theme/ThemeProvider";
import styles from "./GlasswingUserMenu.module.css";

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name && name.trim()) || (email ? email.split("@")[0] : "") || "";
  if (!source) return "·";
  const parts = source
    .replace(/[_.-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return source.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: "system", label: "Auto" },
  { id: "light", label: "Claro" },
  { id: "dark", label: "Escuro" },
];

export function GlasswingUserMenu() {
  const { data: session, status } = useSession();
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    function onClickOutside(event: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
    }, 140);
  };

  if (status !== "authenticated" || !session?.user) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  const name = session.user.name ?? null;
  const email = session.user.email ?? null;
  const image = session.user.image ?? null;
  const initials = getInitials(name, email);

  async function handleSignOut() {
    setPending(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name ? `Conta de ${name}` : "Conta"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.avatar}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className={styles.avatarImg}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className={styles.avatarInitials}>{initials}</span>
          )}
        </span>
      </button>

      {open && (
        <div
          className={styles.menu}
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className={styles.identity}>
            {name && <span className={styles.identityName}>{name}</span>}
            {email && <span className={styles.identityEmail}>{email}</span>}
          </div>
          <div className={styles.sep} aria-hidden="true" />
          <div
            className={styles.themeRow}
            role="group"
            aria-label="Preferência de tema"
          >
            <span className={styles.themeLabel}>Tema</span>
            <div className={styles.themeSwitch}>
              {THEME_OPTIONS.map((opt) => {
                const active = preference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    className={[
                      styles.themeOption,
                      active ? styles.themeOptionActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setPreference(opt.id)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.sep} aria-hidden="true" />
          <button
            type="button"
            role="menuitem"
            className={styles.action}
            disabled={pending}
            onClick={handleSignOut}
          >
            <span>{pending ? "Saindo…" : "Sair"}</span>
            <span aria-hidden="true" className={styles.arrow}>
              ↗
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
