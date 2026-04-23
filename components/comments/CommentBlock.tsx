import { Children, cloneElement, isValidElement, type ReactNode } from "react";

interface CommentBlockProps {
  id: string;
  as?: "div" | "p" | "section" | "article" | "li" | "span";
  children: ReactNode;
  className?: string;
}

/**
 * Marca um trecho do DOM como comentável. O `data-comment-block` é o id estável
 * usado para ancorar threads.
 */
export function CommentBlock({
  id,
  as = "div",
  children,
  className,
}: CommentBlockProps) {
  const Tag = as;
  return (
    <Tag className={className} data-comment-block={id}>
      {children}
    </Tag>
  );
}

/**
 * Percorre `children` e envolve cada elemento diretamente com um wrapper de
 * `data-comment-block` derivado de `prefix.childIndex` (baseado em 1) ou usando
 * um slug existente. Útil para habilitar comentários em cada parágrafo de uma
 * `EditorialProse` sem escrever ids manualmente.
 *
 * Se o filho já tem um `data-comment-block` explícito, ele é preservado.
 */
export function withBlockIds(prefix: string, children: ReactNode): ReactNode {
  let index = 0;
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    index += 1;
    const existingProps = child.props as Record<string, unknown> & {
      "data-comment-block"?: string;
    };
    if (existingProps["data-comment-block"]) {
      return child;
    }
    const blockId = `${prefix}.${index}`;
    return cloneElement(child, {
      "data-comment-block": blockId,
    } as Record<string, unknown>);
  });
}
