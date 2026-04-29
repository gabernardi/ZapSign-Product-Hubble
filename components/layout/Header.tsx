"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { CommentsInboxLink } from "@/components/comments/CommentsInboxLink";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import styles from "./Header.module.css";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/upstream": "Upstream",
  "/dashboard/downstream": "Downstream",
  "/dashboard/comentarios": "Comentários",
  "/dashboard/opportunity-tree": "Árvore de Oportunidades",
};

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];
  let currentPath = "";
  for (const seg of segments) {
    currentPath += `/${seg}`;
    const label = BREADCRUMB_MAP[currentPath];
    if (label) {
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={onMenuToggle}
          aria-label="Abrir menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.crumbWrap}>
          <span className={styles.crumbEyebrow}>Você está em</span>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className={styles.crumbItem}>
                {i > 0 && <span className={styles.crumbSep} aria-hidden="true">›</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className={styles.crumbCurrent}>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className={styles.crumbLink}>
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className={styles.right}>
        <LocaleSwitcher variant="header" />
        <CommentsInboxLink variant="header" />
        <button className={styles.searchPill} aria-label="Buscar">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className={styles.searchText}>Buscar</span>
          <span className={styles.searchKbd}>
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </span>
        </button>

      {session?.user && (
        <div className={styles.userArea} ref={menuRef}>
          <button
            className={styles.avatarButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu do usuário"
            aria-expanded={menuOpen}
          >
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.avatarFallback}>{initials}</div>
            )}
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{session.user.name}</div>
                <div className={styles.dropdownEmail}>{session.user.email}</div>
              </div>
              <div className={styles.dropdownDivider} />
              <button
                className={styles.dropdownItem}
                onClick={() => signOut({ callbackUrl: "/" })}
                role="menuitem"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </header>
  );
}
