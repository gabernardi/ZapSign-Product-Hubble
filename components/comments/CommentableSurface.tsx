"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useComments } from "./CommentProvider";
import { CommentTrigger } from "./CommentTrigger";
import {
  findCommentBlock,
  findQuoteOffsets,
  getBlockRelativeOffsets,
  rangeFromBlockOffsets,
  removeHighlights,
  wrapRangeWithSpans,
} from "./range-utils";
import type { CommentAnchor } from "@/lib/comments/types";
import styles from "./comments.module.css";

interface CommentableSurfaceProps {
  children: ReactNode;
}

interface TriggerState {
  x: number;
  y: number;
  anchor: CommentAnchor;
}

const HIGHLIGHT_CLASS = "hubble-hl";
const HIGHLIGHT_SELECTOR = ".hubble-hl";

export function CommentableSurface({ children }: CommentableSurfaceProps) {
  const {
    threads,
    activeThreadId,
    beginCompose,
    openPanel,
    currentUserEmail,
    panelOpen,
  } = useComments();
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<TriggerState | null>(null);

  const openThreads = useMemo(
    () => threads.filter((t) => t.status === "open"),
    [threads],
  );

  // Re-aplica highlights sempre que a lista de threads ou o thread ativo muda.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    removeHighlights(surface, HIGHLIGHT_SELECTOR);

    // Aplica na ordem: maiores primeiro (para o menor ficar por cima nas sobreposições)
    const sorted = [...openThreads].sort(
      (a, b) =>
        (b.anchor.endOffset - b.anchor.startOffset) -
        (a.anchor.endOffset - a.anchor.startOffset),
    );

    for (const thread of sorted) {
      const block = surface.querySelector<HTMLElement>(
        `[data-comment-block="${cssEscape(thread.anchor.blockId)}"]`,
      );
      if (!block) continue;

      let range = rangeFromBlockOffsets(
        block,
        thread.anchor.startOffset,
        thread.anchor.endOffset,
      );
      const currentQuote = range ? range.toString() : "";
      if (!range || currentQuote.trim() !== thread.anchor.quote.trim()) {
        const fallback = findQuoteOffsets(block, thread.anchor.quote);
        if (fallback) {
          range = rangeFromBlockOffsets(block, fallback.start, fallback.end);
        }
      }
      if (!range) continue;

      const spans = wrapRangeWithSpans(range, HIGHLIGHT_CLASS, {
        "data-thread-id": thread.id,
        role: "button",
        "aria-label": `Abrir comentário: ${truncate(thread.anchor.quote, 60)}`,
        tabindex: "0",
      });
      if (activeThreadId === thread.id) {
        spans.forEach((s) => s.classList.add("is-active"));
      }
    }
  }, [openThreads, activeThreadId]);

  // Click nos highlights (via delegação).
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const handler = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const hl = target.closest<HTMLElement>(HIGHLIGHT_SELECTOR);
      if (!hl) return;
      const threadId = hl.dataset.threadId;
      if (!threadId) return;
      event.preventDefault();
      openPanel(threadId);
    };
    surface.addEventListener("click", handler);
    return () => surface.removeEventListener("click", handler);
  }, [openPanel]);

  const computeTrigger = useCallback((): TriggerState | null => {
    const surface = surfaceRef.current;
    if (!surface) return null;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null;
    }
    const range = selection.getRangeAt(0);
    if (range.collapsed) return null;
    if (!surface.contains(range.commonAncestorContainer)) return null;

    const startBlock = findCommentBlock(range.startContainer);
    const endBlock = findCommentBlock(range.endContainer);
    if (!startBlock || startBlock !== endBlock) return null;

    if (
      isInsideSkipZone(range.startContainer) ||
      isInsideSkipZone(range.endContainer)
    ) {
      return null;
    }

    const blockId = startBlock.dataset.commentBlock;
    if (!blockId) return null;

    const offsets = getBlockRelativeOffsets(startBlock, range);
    if (!offsets) return null;

    const rects = range.getClientRects();
    const rect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;

    // Centro horizontal da primeira linha da seleção (evita trigger desalinhado
    // quando a seleção envolve várias linhas).
    const fullRect = range.getBoundingClientRect();
    const x =
      rects.length === 1
        ? rect.left + rect.width / 2
        : fullRect.left + fullRect.width / 2;
    const y = rect.top;

    return {
      x,
      y,
      anchor: {
        blockId,
        startOffset: offsets.start,
        endOffset: offsets.end,
        quote: offsets.quote,
      },
    };
  }, []);

  // Observa seleção para mostrar o trigger flutuante.
  //
  // Estratégia: atualizamos a posição no `pointerup`/`keyup`/`touchend`
  // (quando a seleção estabilizou), e usamos `selectionchange` APENAS para
  // esconder o trigger quando a seleção colapsa. Isso evita o "dançar" do
  // botão enquanto o usuário ainda arrasta o mouse.
  useEffect(() => {
    if (!currentUserEmail) return;
    if (panelOpen) return;

    let dragging = false;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-comments-skip]")) return;
      // Clicar em uma highlight existente não deve iniciar o fluxo de seleção
      // nem esconder trigger: o click handler do surface abrirá o painel.
      if (target?.closest(".hubble-hl")) return;
      dragging = true;
      setTrigger(null);
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      // Aguarda o selectionchange assentar antes de medir.
      window.setTimeout(() => {
        setTrigger(computeTrigger());
      }, 10);
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.shiftKey || event.key.startsWith("Arrow")) {
        setTrigger(computeTrigger());
      }
    }

    function onSelectionChange() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setTrigger(null);
      }
    }

    function onScrollOrResize() {
      // Reposiciona sem recriar se já existe trigger válido.
      setTrigger((curr) => (curr ? computeTrigger() : curr));
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [currentUserEmail, panelOpen, computeTrigger]);

  const handleTriggerClick = useCallback(() => {
    if (!trigger) return;
    const anchor = trigger.anchor;
    window.getSelection()?.removeAllRanges();
    setTrigger(null);
    beginCompose(anchor);
  }, [trigger, beginCompose]);

  const visibleTrigger = panelOpen ? null : trigger;
  const canPortal = typeof document !== "undefined";

  return (
    <div ref={surfaceRef} className={styles.surface}>
      {children}
      {canPortal && visibleTrigger
        ? createPortal(
            <div
              className={styles.triggerPortal}
              style={{
                left: `${visibleTrigger.x}px`,
                top: `${visibleTrigger.y}px`,
              }}
              data-comments-skip=""
            >
              <CommentTrigger onClick={handleTriggerClick} />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function isInsideSkipZone(node: Node | null): boolean {
  let current: Node | null = node;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      if (el.dataset?.commentsSkip !== undefined) return true;
    }
    current = current.parentNode;
  }
  return false;
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\\]]/g, "\\$&");
}
