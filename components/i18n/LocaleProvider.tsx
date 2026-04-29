"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TranslationEngine } from "@/lib/i18n/dom-engine";
import {
  DEFAULT_LOCALE,
  LOCALE_BCP47,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "@/lib/i18n/types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  isTranslating: boolean;
  isLoginContext: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  initialLocale: Locale;
  isLoginContext?: boolean;
  children: React.ReactNode;
}

const SCAN_DEBOUNCE_MS = 120;
const FETCH_BATCH_SIZE = 80;
const FETCH_CONCURRENCY = 3;

async function postTranslate(
  locale: Locale,
  texts: string[],
  isLoginContext: boolean,
): Promise<Record<string, string>> {
  if (texts.length === 0) return {};
  const out: Record<string, string> = {};
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += FETCH_BATCH_SIZE) {
    batches.push(texts.slice(i, i + FETCH_BATCH_SIZE));
  }

  let cursor = 0;
  async function worker() {
    while (cursor < batches.length) {
      const idx = cursor++;
      const batch = batches[idx];
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            texts: batch,
            context: isLoginContext ? "login" : undefined,
          }),
        });
        if (!res.ok) {
          console.warn("[i18n] /api/translate non-ok:", res.status);
          continue;
        }
        const json = (await res.json()) as {
          translations?: Record<string, string>;
        };
        if (json.translations) {
          for (const [k, v] of Object.entries(json.translations)) out[k] = v;
        }
      } catch (err) {
        console.warn("[i18n] /api/translate failed:", err);
      }
    }
  }
  const workers = Array.from(
    { length: Math.min(FETCH_CONCURRENCY, batches.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return out;
}

export function LocaleProvider({
  initialLocale,
  isLoginContext = false,
  children,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isTranslating, setIsTranslating] = useState(false);
  const pathname = usePathname();

  const engineRef = useRef<TranslationEngine | null>(null);
  if (engineRef.current === null) engineRef.current = new TranslationEngine();

  const localeRef = useRef<Locale>(initialLocale);
  localeRef.current = locale;

  const scanScheduledRef = useRef<number | null>(null);
  const scanInFlightRef = useRef(false);
  const scanRequeueRef = useRef(false);

  const runScan = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    const target = localeRef.current;
    if (target === DEFAULT_LOCALE) return;
    if (typeof document === "undefined") return;

    if (scanInFlightRef.current) {
      scanRequeueRef.current = true;
      return;
    }
    scanInFlightRef.current = true;
    try {
      engine.setTargetLocale(target);
      const { pending, apply } = engine.collect(document.body);
      if (apply.length === 0) return;

      if (pending.length > 0) {
        setIsTranslating(true);
        try {
          const fresh = await postTranslate(target, pending, isLoginContext);
          // Idioma pode ter mudado durante o fetch.
          if (localeRef.current !== target) return;
          engine.preloadDict(fresh);
        } finally {
          setIsTranslating(false);
        }
      }
      engine.applyAll(apply);
    } finally {
      scanInFlightRef.current = false;
      if (scanRequeueRef.current) {
        scanRequeueRef.current = false;
        scheduleScan();
      }
    }
  }, [isLoginContext]);

  const scheduleScan = useCallback(() => {
    if (typeof window === "undefined") return;
    if (scanScheduledRef.current !== null) return;
    scanScheduledRef.current = window.setTimeout(() => {
      scanScheduledRef.current = null;
      void runScan();
    }, SCAN_DEBOUNCE_MS);
  }, [runScan]);

  const setLocale = useCallback((next: Locale) => {
    if (next === localeRef.current) return;
    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LOCALE_COOKIE, next);
      } catch {
        // Sem localStorage (modo privado em alguns browsers); cookie já foi setado.
      }
    }
    setLocaleState(next);
  }, []);

  // Quando o locale muda, ou aplica restauração (volta ao PT) ou
  // dispara o scan inicial.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (typeof document === "undefined") return;
    document.documentElement.lang = LOCALE_BCP47[locale];
    if (locale === DEFAULT_LOCALE) {
      engine.restoreAll(document.body);
      return;
    }
    scheduleScan();
  }, [locale, scheduleScan]);

  // Mudança de rota → re-scan (a maior parte do DOM novo virá pelo
  // MutationObserver, mas pra garantir que rodamos uma vez deterministicamente
  // após hidration de rota nova).
  useEffect(() => {
    if (locale === DEFAULT_LOCALE) return;
    scheduleScan();
  }, [pathname, locale, scheduleScan]);

  // MutationObserver: re-aplica tradução em conteúdo novo / re-renders do React.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const engine = engineRef.current;
    if (!engine) return;

    const observer = new MutationObserver((mutations) => {
      if (engine.isApplying()) return;
      if (localeRef.current === DEFAULT_LOCALE) return;
      let needsScan = false;
      for (const m of mutations) {
        if (m.type === "characterData") {
          const node = m.target as Text;
          const v = node.nodeValue ?? "";
          if (engine.hasOurMark(node, v)) continue;
          needsScan = true;
          break;
        }
        if (m.type === "attributes") {
          const el = m.target as Element;
          const attr = m.attributeName;
          if (
            attr === "placeholder" ||
            attr === "aria-label" ||
            attr === "title" ||
            attr === "alt"
          ) {
            const v = el.getAttribute(attr) ?? "";
            if (engine.hasOurAttrMark(el, attr, v)) continue;
            needsScan = true;
            break;
          }
        }
        if (m.type === "childList" && m.addedNodes.length > 0) {
          needsScan = true;
          break;
        }
      }
      if (needsScan) scheduleScan();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title", "alt"],
    });

    return () => {
      observer.disconnect();
      if (scanScheduledRef.current !== null) {
        window.clearTimeout(scanScheduledRef.current);
        scanScheduledRef.current = null;
      }
    };
  }, [scheduleScan]);

  // Sincronização defensiva com localStorage no mount: se um cookie mais
  // novo já existir, ele venceu (server enviou). Mas se localStorage tem
  // valor diferente do prop inicial (ex.: cliente trocou em outra aba)
  // adotamos.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(LOCALE_COOKIE);
      if (isLocale(stored) && stored !== localeRef.current) {
        setLocaleState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, isTranslating, isLoginContext }),
    [locale, setLocale, isTranslating, isLoginContext],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      isTranslating: false,
      isLoginContext: false,
    };
  }
  return ctx;
}
