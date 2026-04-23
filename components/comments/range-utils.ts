/**
 * Helpers puros para converter entre objetos `Range` do DOM e offsets de
 * caractere relativos ao `textContent` de um bloco comentável.
 *
 * Assume que o conteúdo do bloco é estável durante o uso. A hidratação de
 * threads tolera drift via fallback por `quote` no CommentableSurface.
 */

export function findCommentBlock(node: Node | null): HTMLElement | null {
  let current: Node | null = node;
  while (current) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      (current as HTMLElement).dataset?.commentBlock
    ) {
      return current as HTMLElement;
    }
    current = current.parentNode;
  }
  return null;
}

function isInsideSkipped(node: Node): boolean {
  let current: Node | null = node.parentNode;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      if (el.dataset?.commentsSkip !== undefined) return true;
    }
    current = current.parentNode;
  }
  return false;
}

function createTextWalker(root: HTMLElement): TreeWalker {
  return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (isInsideSkipped(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
}

/**
 * Calcula os offsets de caractere de um Range em relação ao texto do bloco.
 * Retorna null se o range cruza blocos diferentes do fornecido.
 */
export function getBlockRelativeOffsets(
  block: HTMLElement,
  range: Range,
): { start: number; end: number; quote: string } | null {
  if (!block.contains(range.startContainer) || !block.contains(range.endContainer)) {
    return null;
  }
  const walker = createTextWalker(block);
  let offset = 0;
  let start = -1;
  let end = -1;
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.nodeValue ?? "";
    if (node === range.startContainer) {
      start = offset + range.startOffset;
    }
    if (node === range.endContainer) {
      end = offset + range.endOffset;
      break;
    }
    offset += text.length;
    node = walker.nextNode();
  }
  if (start < 0 || end < 0 || end <= start) return null;
  const quote = block.textContent?.slice(start, end) ?? "";
  if (!quote.trim()) return null;
  return { start, end, quote };
}

/**
 * Retorna um Range iniciando em `start` e terminando em `end` (offsets de
 * caractere relativos ao textContent do bloco). Retorna null se offsets
 * estão fora do alcance.
 */
export function rangeFromBlockOffsets(
  block: HTMLElement,
  start: number,
  end: number,
): Range | null {
  if (end <= start) return null;
  const walker = createTextWalker(block);
  let offset = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;
  let node = walker.nextNode() as Text | null;
  while (node) {
    const len = (node.nodeValue ?? "").length;
    const nodeStart = offset;
    const nodeEnd = offset + len;
    if (!startNode && start >= nodeStart && start <= nodeEnd) {
      startNode = node;
      startOffset = start - nodeStart;
    }
    if (startNode && end >= nodeStart && end <= nodeEnd) {
      endNode = node;
      endOffset = end - nodeStart;
      break;
    }
    offset = nodeEnd;
    node = walker.nextNode() as Text | null;
  }
  if (!startNode || !endNode) return null;
  try {
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  } catch {
    return null;
  }
}

/**
 * Localiza a primeira ocorrência de `quote` dentro do block e retorna os
 * offsets correspondentes. Usado como fallback quando o conteúdo mudou mas
 * o trecho ainda existe.
 */
export function findQuoteOffsets(
  block: HTMLElement,
  quote: string,
): { start: number; end: number } | null {
  const text = block.textContent ?? "";
  if (!quote) return null;
  const idx = text.indexOf(quote);
  if (idx === -1) return null;
  return { start: idx, end: idx + quote.length };
}

/**
 * Envolve cada segmento de texto do `range` em um `<span>` com classe `className`
 * e atributos adicionais (usados para identificar a thread). Preserva texto
 * e não duplica conteúdo. Retorna os spans criados.
 */
export function wrapRangeWithSpans(
  range: Range,
  className: string,
  attrs: Record<string, string>,
): HTMLSpanElement[] {
  const nodesInRange: Text[] = [];

  if (
    range.startContainer === range.endContainer &&
    range.startContainer.nodeType === Node.TEXT_NODE
  ) {
    // Caso comum: seleção inteira dentro de um único text node (ex.: "downstream"
    // em um parágrafo sem marcação). O TreeWalker não caminha quando o root é
    // um text node, então tratamos esse caso diretamente.
    nodesInRange.push(range.startContainer as Text);
  } else {
    let root: Node = range.commonAncestorContainer;
    if (root.nodeType !== Node.ELEMENT_NODE) {
      root = root.parentNode ?? root;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode() as Text | null;
    while (current) {
      // Considera todos text nodes que intersectam parcialmente o range.
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(current);
      if (
        range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
        range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
      ) {
        nodesInRange.push(current);
      }
      current = walker.nextNode() as Text | null;
    }
  }

  const spans: HTMLSpanElement[] = [];
  for (const textNode of nodesInRange) {
    if (isInsideSkipped(textNode)) continue;
    const text = textNode.nodeValue ?? "";
    if (!text) continue;
    const isStart = textNode === range.startContainer;
    const isEnd = textNode === range.endContainer;
    const from = isStart ? range.startOffset : 0;
    const to = isEnd ? range.endOffset : text.length;
    if (to <= from) continue;

    const before = text.slice(0, from);
    const middle = text.slice(from, to);
    const after = text.slice(to);

    const parent = textNode.parentNode;
    if (!parent) continue;

    const span = document.createElement("span");
    span.className = className;
    for (const [k, v] of Object.entries(attrs)) {
      span.setAttribute(k, v);
    }
    span.textContent = middle;

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    frag.appendChild(span);
    if (after) frag.appendChild(document.createTextNode(after));

    parent.replaceChild(frag, textNode);
    spans.push(span);
  }
  return spans;
}

export function removeHighlights(root: HTMLElement, selector: string): void {
  const nodes = root.querySelectorAll<HTMLSpanElement>(selector);
  nodes.forEach((span) => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span);
    }
    parent.removeChild(span);
    parent.normalize?.();
  });
}
