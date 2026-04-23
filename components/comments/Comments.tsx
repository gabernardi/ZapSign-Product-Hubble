"use client";

import type { ReactNode } from "react";
import { CommentProvider } from "./CommentProvider";
import { CommentableSurface } from "./CommentableSurface";
import { CommentsPanel } from "./CommentsPanel";
import { CommentsToggle } from "./CommentsToggle";
import type { Thread } from "@/lib/data/comments";

interface CommentsProps {
  pageId: string;
  initialThreads: Thread[];
  refreshOnMount?: boolean;
  children: ReactNode;
}

/**
 * Wrapper único que monta toda a stack de comentários em torno do conteúdo de
 * uma página editorial. Assume que já existe um `<SessionProvider>` acima na
 * árvore (fornecido por `(authenticated)/layout.tsx`).
 */
export function Comments({
  pageId,
  initialThreads,
  refreshOnMount,
  children,
}: CommentsProps) {
  return (
    <CommentProvider
      pageId={pageId}
      initialThreads={initialThreads}
      refreshOnMount={refreshOnMount}
    >
      <CommentableSurface>{children}</CommentableSurface>
      <CommentsToggle />
      <CommentsPanel />
    </CommentProvider>
  );
}
