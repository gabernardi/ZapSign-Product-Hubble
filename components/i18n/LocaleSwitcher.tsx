"use client";

import { useEffect, useRef, useState } from "react";
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT,
  type Locale,
} from "@/lib/i18n/types";
import { useLocale } from "./LocaleProvider";
import styles from "./LocaleSwitcher.module.css";

type Variant = "header" | "glasswing" | "login";

interface LocaleSwitcherProps {
  variant?: Variant;
}

const FLAG_PATHS: Record<Locale, React.ReactNode> = {
  pt: (
    <>
      <rect width="20" height="14" rx="2" fill="#009C3B" />
      <path
        d="M10 2.4l6.6 4.6L10 11.6 3.4 7z"
        fill="#FFDF00"
      />
      <circle cx="10" cy="7" r="2.3" fill="#002776" />
    </>
  ),
  en: (
    <>
      <rect width="20" height="14" rx="2" fill="#012169" />
      <path
        d="M0 0l20 14M20 0L0 14"
        stroke="#FFFFFF"
        strokeWidth="2.4"
      />
      <path
        d="M0 0l20 14M20 0L0 14"
        stroke="#C8102E"
        strokeWidth="1.2"
      />
      <path d="M10 0v14M0 7h20" stroke="#FFFFFF" strokeWidth="3.6" />
      <path d="M10 0v14M0 7h20" stroke="#C8102E" strokeWidth="2" />
    </>
  ),
  es: (
    <>
      <rect width="20" height="14" rx="2" fill="#AA151B" />
      <rect y="3.5" width="20" height="7" fill="#F1BF00" />
    </>
  ),
};

function FlagIcon({ locale }: { locale: Locale }) {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      role="img"
      aria-label={LOCALE_LABELS[locale]}
      data-no-translate
    >
      <defs>
        <clipPath id={`localeFlagClip-${locale}`}>
          <rect width="20" height="14" rx="2" />
        </clipPath>
      </defs>
      <g clipPath={`url(#localeFlagClip-${locale})`}>{FLAG_PATHS[locale]}</g>
      <rect
        x="0.4"
        y="0.4"
        width="19.2"
        height="13.2"
        rx="1.8"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function LocaleSwitcher({ variant = "header" }: LocaleSwitcherProps) {
  const { locale, setLocale, isTranslating } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${styles[`variant_${variant}`]}`}
      data-no-translate
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label="Mudar idioma"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={`Idioma: ${LOCALE_LABELS[locale]}`}
      >
        <FlagIcon locale={locale} />
        <span className={styles.code}>{LOCALE_SHORT[locale]}</span>
        {isTranslating && (
          <span
            className={styles.spinner}
            aria-label="Traduzindo"
            role="status"
          />
        )}
        <svg
          className={styles.caret}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
        >
          <path
            d="M2 4l3 3 3-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className={styles.menu} role="listbox">
          {LOCALES.map((loc) => {
            const active = loc === locale;
            return (
              <button
                key={loc}
                type="button"
                className={`${styles.item} ${active ? styles.itemActive : ""}`}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(loc);
                  setOpen(false);
                }}
              >
                <FlagIcon locale={loc} />
                <span className={styles.itemLabel}>{LOCALE_LABELS[loc]}</span>
                <span className={styles.itemCode}>{LOCALE_SHORT[loc]}</span>
                {active && (
                  <svg
                    className={styles.check}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 6.2l2.4 2.4L9.5 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
