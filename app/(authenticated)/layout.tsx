"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { CommentsInboxProvider } from "@/components/comments/CommentsInboxProvider";
import { CommentsRealtimeProvider } from "@/components/comments/CommentsRealtimeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import styles from "./layout.module.css";

// Rotas que usam o próprio shell editorial (Glasswing) e portanto não devem
// receber a Sidebar/Header legados deste layout. Prefixos cobrem subrotas
// (ex.: /dashboard/roadmap/1t26, /dashboard/roadmap/3t26…) sem exigir
// atualização manual a cada trimestre.
const FULL_BLEED_EXACT = ["/dashboard"];
const FULL_BLEED_PREFIXES = [
  "/dashboard/downstream",
  "/dashboard/upstream",
  "/dashboard/papeis",
  "/dashboard/roadmap",
  "/dashboard/contribuir",
  "/dashboard/changelog",
  "/dashboard/comentarios",
  "/dashboard/ferramentas",
];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isFullBleed =
    FULL_BLEED_EXACT.includes(pathname) ||
    FULL_BLEED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

  if (isFullBleed) {
    return (
      <SessionProvider>
        <CommentsRealtimeProvider>
          <CommentsInboxProvider>{children}</CommentsInboxProvider>
        </CommentsRealtimeProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <CommentsRealtimeProvider>
        <CommentsInboxProvider>
          <div className={styles.layout}>
            <Sidebar
              mobileOpen={mobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
            <div className={styles.main}>
              <Header onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
              <div className={styles.content}>{children}</div>
            </div>
          </div>
        </CommentsInboxProvider>
      </CommentsRealtimeProvider>
    </SessionProvider>
  );
}
