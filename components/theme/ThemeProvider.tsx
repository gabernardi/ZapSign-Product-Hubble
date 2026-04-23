"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  toggle: () => void;
}

const STORAGE_KEY = "zs-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "light";
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // localStorage unavailable (private mode, SSR edge). Fall through.
  }
  // No stored preference: Hubble ships with light as the default. Users can
  // still opt into dark or system via the theme toggle.
  return "light";
}

function resolvePreference(pref: ThemePreference): ResolvedTheme {
  if (pref === "light" || pref === "dark") return pref;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyResolved(pref: ThemePreference, resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // When the preference follows the system, we leave the attribute off so the
  // @media (prefers-color-scheme) rules in globals.css own the value.
  if (pref === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", resolved);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initial state is computed lazily so we read the preference synchronously
  // on mount — the pre-hydration script has already set <html data-theme>, so
  // we just mirror it here.
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    readStoredPreference(),
  );
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolvePreference(readStoredPreference()),
  );

  // Keep the resolved value in sync with system changes when the preference
  // follows the system. Also re-applies the attribute defensively on mount.
  useEffect(() => {
    applyResolved(preference, resolved);
    if (preference !== "system" || typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => {
      const next: ResolvedTheme = mql.matches ? "light" : "dark";
      setResolved(next);
      applyResolved("system", next);
    };
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
    // `resolved` is intentionally excluded — we only want this effect to
    // re-run when the preference changes (e.g., switching to/from system).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    const nextResolved = resolvePreference(next);
    setResolved(nextResolved);
    applyResolved(next, nextResolved);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(resolved === "light" ? "dark" : "light");
  }, [resolved, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, setPreference, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback for components rendered outside the provider (shouldn't
    // happen in production, but keeps storybook/tests simple).
    return {
      preference: "system",
      resolved: "light",
      setPreference: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

/**
 * Script executed before React hydrates: reads the stored preference and
 * applies it to <html data-theme> so the first paint matches the user choice
 * (no flash of dark while mounted on a light preference, and vice versa).
 */
export const THEME_INIT_SCRIPT = `(() => {
  try {
    var k = '${STORAGE_KEY}';
    var v = localStorage.getItem(k);
    if (v === 'light' || v === 'dark') {
      document.documentElement.setAttribute('data-theme', v);
    } else if (v === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      // No stored preference: default to light to match Hubble's ship state.
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();`;
