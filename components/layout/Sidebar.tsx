"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        label: "Roadmap",
        href: "/dashboard/roadmap",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 3v5M13 3v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 12h3M11 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Processo",
    items: [
      {
        label: "Upstream",
        href: "/dashboard/upstream",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v14M10 3l4 4M10 3L6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        label: "Downstream",
        href: "/dashboard/downstream",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 17V3M10 17l4-4M10 17l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        label: "Liderança",
        href: "/dashboard/management-tips",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Explorações",
    items: [
      {
        label: "Árvore de Oportunidades",
        href: "/dashboard/opportunity-tree",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="5" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="15" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6.5v3L5 11.5M10 9.5l5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
        comingSoon: true,
      },
    ],
  },
  {
    label: "Laboratório",
    items: [
      {
        label: "Laboratório",
        href: "/dashboard/contribuir",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M8 3h4M9 3v4.5L4.5 15a1.5 1.5 0 0 0 1.3 2.2h8.4A1.5 1.5 0 0 0 15.5 15L11 7.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="8.5" cy="13" r="0.8" fill="currentColor" />
            <circle cx="11.5" cy="14.5" r="0.6" fill="currentColor" />
          </svg>
        ),
      },
      {
        label: "Changelog",
        href: "/dashboard/changelog",
        badge: "Beta",
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M4 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="4" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="4" cy="14" r="1.6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 6h8M8 10h6M8 14h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <img src="/zapsign-logo.svg" alt="" className={styles.brandLogo} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>ZapSign</span>
            <span className={styles.brandSub}>Product OS</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.group}>
              <div className={styles.groupLabel}>{group.label}</div>
              <div className={styles.groupList}>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  if (item.comingSoon) {
                    return (
                      <div
                        key={item.href}
                        className={`${styles.navItem} ${styles.disabled}`}
                        aria-disabled="true"
                      >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navText}>{item.label}</span>
                        <span className={styles.badge}>Em breve</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                      onClick={onMobileClose}
                    >
                      <span className={styles.navIndicator} aria-hidden="true" />
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navText}>{item.label}</span>
                      {item.badge && (
                        <span className={styles.betaBadge}>{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.footerStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>Tudo operacional</span>
          </div>
          <div className={styles.kbdHint}>
            Buscar
            <kbd className={styles.kbd}>⌘</kbd>
            <kbd className={styles.kbd}>K</kbd>
          </div>
        </div>
      </aside>
    </>
  );
}
