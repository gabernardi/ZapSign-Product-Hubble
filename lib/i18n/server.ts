import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./types";

/**
 * Lê o cookie `ph_locale` do request atual, se houver, ou cai pro
 * default (PT-BR). Usado pelos layouts/server components pra hidratar
 * o LocaleProvider sem flicker de idioma.
 */
export async function getInitialLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const value = store.get(LOCALE_COOKIE)?.value;
    if (isLocale(value)) return value;
  } catch {
    // Fora de um request (ex.: build estático): cai pro default.
  }
  return DEFAULT_LOCALE;
}
