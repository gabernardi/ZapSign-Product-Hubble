"use client";

import type { Locale } from "./types";

/**
 * Engine de tradução DOM-walking. Mantém o estado de:
 *
 *  - `originals`: WeakMap<Text, string> — primeiro valor visto de cada
 *    text node (PT-BR canônico). É a fonte da verdade pra restauração.
 *  - `lastApplied`: WeakMap<Text, string> — último valor que ESTE engine
 *    escreveu naquele node. Serve pro MutationObserver distinguir mudanças
 *    nossas (ignorar) de mudanças do React/usuário (re-traduzir).
 *  - mesma coisa para atributos (`placeholder`, `aria-label`, `title`,
 *    `alt`) por elemento.
 *  - `dict`: Map<sourceTrimmed, translated> com as traduções já recebidas
 *    do servidor pra evitar bater na API toda hora.
 *
 * O fluxo de aplicação é:
 *
 *   collectTargets() → identify pending sources → fetch only the misses →
 *   applyDict() (tudo em um batch, com flag pra MutationObserver)
 *
 * O `setApplying(true)` envolve as escritas; o flag é limpo num
 * `setTimeout(…, 0)` pra garantir que todos os callbacks de
 * MutationObserver (microtasks) já tenham sido drenados antes de baixar
 * pra zero.
 */

const TEXT_EXCLUDED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "SVG",
  "PATH",
]);

const ATTR_NAMES = ["placeholder", "aria-label", "title", "alt"] as const;
type AttrName = (typeof ATTR_NAMES)[number];

const URL_LIKE = /^(https?:\/\/|www\.|mailto:|tel:)/i;
const EMAIL_LIKE = /^\S+@\S+\.\S+$/;
const NUMBER_LIKE = /^[\s\d.,:%/+\-–—()$€£R$]+$/;

function isTranslatable(trimmed: string): boolean {
  if (trimmed.length < 2) return false;
  if (URL_LIKE.test(trimmed)) return false;
  if (EMAIL_LIKE.test(trimmed)) return false;
  if (NUMBER_LIKE.test(trimmed)) return false;
  if (!/[\p{L}]/u.test(trimmed)) return false;
  return true;
}

function isExcludedAncestor(el: Element | null): boolean {
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    if (TEXT_EXCLUDED_TAGS.has(cur.tagName)) return true;
    if (cur.hasAttribute("data-no-translate")) return true;
    if (cur.getAttribute("contenteditable") === "true") return true;
    if (cur.getAttribute("aria-hidden") === "true") {
      // Decorative regions (the FlowArt SVG no login, etc) — pular.
      // Só fazemos cut no nível raiz da região decorativa, mas ok pra
      // economizar trabalho.
      return true;
    }
    cur = cur.parentElement;
  }
  return false;
}

function splitWhitespace(value: string): {
  lead: string;
  body: string;
  trail: string;
} {
  const m = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!m) return { lead: "", body: value, trail: "" };
  return { lead: m[1] ?? "", body: m[2] ?? "", trail: m[3] ?? "" };
}

interface TextTarget {
  kind: "text";
  node: Text;
  original: string;
  source: string;
}

interface AttrTarget {
  kind: "attr";
  element: Element;
  attr: AttrName;
  original: string;
  source: string;
}

type Target = TextTarget | AttrTarget;

export class TranslationEngine {
  private originalsText = new WeakMap<Text, string>();
  private lastAppliedText = new WeakMap<Text, string>();
  private originalsAttr = new WeakMap<Element, Partial<Record<AttrName, string>>>();
  private lastAppliedAttr = new WeakMap<
    Element,
    Partial<Record<AttrName, string>>
  >();
  private dict = new Map<string, string>();
  private dictLocale: Locale | null = null;
  private applyingDepth = 0;

  isApplying(): boolean {
    return this.applyingDepth > 0;
  }

  hasOurMark(node: Text, value: string): boolean {
    return this.lastAppliedText.get(node) === value;
  }

  hasOurAttrMark(el: Element, attr: AttrName, value: string): boolean {
    return this.lastAppliedAttr.get(el)?.[attr] === value;
  }

  /**
   * Reseta o dicionário em memória quando o idioma alvo muda. Os
   * originais ficam preservados (são PT-BR e não dependem do alvo).
   */
  setTargetLocale(locale: Locale): void {
    if (this.dictLocale !== locale) {
      this.dict.clear();
      this.dictLocale = locale;
    }
  }

  preloadDict(entries: Record<string, string>): void {
    for (const [source, translated] of Object.entries(entries)) {
      this.dict.set(source, translated);
    }
  }

  /**
   * Restaura todos os textos para o original PT-BR. Útil quando o
   * usuário volta pro idioma padrão sem precisar de chamada de IA.
   */
  restoreAll(root: HTMLElement): void {
    const writes: Array<() => void> = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const t = node as Text;
      const original = this.originalsText.get(t);
      if (typeof original === "string" && t.nodeValue !== original) {
        writes.push(() => {
          t.nodeValue = original;
          this.lastAppliedText.set(t, original);
        });
      }
    }
    const elementWalker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
    );
    let el: Node | null;
    while ((el = elementWalker.nextNode())) {
      const element = el as Element;
      const stored = this.originalsAttr.get(element);
      if (!stored) continue;
      for (const attr of ATTR_NAMES) {
        const original = stored[attr];
        if (typeof original !== "string") continue;
        if (element.getAttribute(attr) !== original) {
          writes.push(() => {
            element.setAttribute(attr, original);
            const map = this.lastAppliedAttr.get(element) ?? {};
            map[attr] = original;
            this.lastAppliedAttr.set(element, map);
          });
        }
      }
    }
    this.flush(writes);
    this.dict.clear();
    this.dictLocale = null;
  }

  /**
   * Coleta todos os alvos no subtree de `root` que precisam de tradução
   * (texto ou atributo) E que ainda não estão com o valor desejado.
   *
   * Para cada alvo, registra o original (se ainda não registrado) e
   * decide se o source já está no dicionário (pode aplicar de imediato)
   * ou precisa de fetch.
   */
  collect(root: HTMLElement): {
    pending: string[];
    apply: Target[];
  } {
    const pendingSet = new Set<string>();
    const apply: Target[] = [];

    const textWalker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (n) => {
          const t = n as Text;
          if (!t.nodeValue || !t.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          if (isExcludedAncestor(t.parentElement)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let textNode: Node | null;
    while ((textNode = textWalker.nextNode())) {
      const t = textNode as Text;
      const stored = this.originalsText.get(t);
      const current = t.nodeValue ?? "";
      let original: string;
      if (typeof stored === "string") {
        original = stored;
      } else {
        // Se este node já foi escrito por outro engine (raro) ou está
        // com valor estrangeiro, ainda assim cravamos o que vemos como
        // "original" — é o melhor que temos.
        original = current;
        this.originalsText.set(t, original);
      }
      const { body } = splitWhitespace(original);
      if (!isTranslatable(body)) continue;
      apply.push({ kind: "text", node: t, original, source: body });
      if (!this.dict.has(body)) pendingSet.add(body);
    }

    const elWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let elNode: Node | null;
    while ((elNode = elWalker.nextNode())) {
      const el = elNode as Element;
      if (isExcludedAncestor(el)) continue;
      for (const attr of ATTR_NAMES) {
        if (!el.hasAttribute(attr)) continue;
        const current = el.getAttribute(attr) ?? "";
        if (!current.trim()) continue;
        const storedMap = this.originalsAttr.get(el) ?? {};
        let original: string;
        if (typeof storedMap[attr] === "string") {
          original = storedMap[attr] as string;
        } else {
          original = current;
          storedMap[attr] = original;
          this.originalsAttr.set(el, storedMap);
        }
        const { body } = splitWhitespace(original);
        if (!isTranslatable(body)) continue;
        apply.push({ kind: "attr", element: el, attr, original, source: body });
        if (!this.dict.has(body)) pendingSet.add(body);
      }
    }

    return { pending: [...pendingSet], apply };
  }

  applyAll(targets: Target[]): void {
    const writes: Array<() => void> = [];
    for (const target of targets) {
      const translated = this.dict.get(target.source);
      if (typeof translated !== "string") continue;
      const { lead, trail } = splitWhitespace(target.original);
      const finalValue = lead + translated + trail;
      if (target.kind === "text") {
        if (target.node.nodeValue === finalValue) continue;
        writes.push(() => {
          target.node.nodeValue = finalValue;
          this.lastAppliedText.set(target.node, finalValue);
        });
      } else {
        if (target.element.getAttribute(target.attr) === finalValue) continue;
        writes.push(() => {
          target.element.setAttribute(target.attr, finalValue);
          const map = this.lastAppliedAttr.get(target.element) ?? {};
          map[target.attr] = finalValue;
          this.lastAppliedAttr.set(target.element, map);
        });
      }
    }
    this.flush(writes);
  }

  private flush(writes: Array<() => void>): void {
    if (writes.length === 0) return;
    this.applyingDepth += 1;
    try {
      for (const w of writes) w();
    } finally {
      // setTimeout 0 garante drain dos callbacks de MutationObserver
      // (microtasks) antes de zerar o flag.
      setTimeout(() => {
        this.applyingDepth = Math.max(0, this.applyingDepth - 1);
      }, 0);
    }
  }
}
