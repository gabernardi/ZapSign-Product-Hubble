"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./GlasswingShell.module.css";
import type { GlasswingNavItem } from "./GlasswingShell";

interface GlasswingNavProps {
  items: GlasswingNavItem[];
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function GlasswingNav({ items }: GlasswingNavProps) {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {items.map((item) => {
        if (item.children && item.children.length > 0) {
          return <NavDropdown key={item.label} item={item} />;
        }

        const className = cx(
          styles.navItem,
          item.active && styles.navItemActive,
          item.flair === "lab" && styles.navItemLab,
        );

        const inner = (
          <>
            {item.flair === "lab" && (
              <span className={styles.navFlair} aria-hidden="true" />
            )}
            {item.label}
            {item.external && (
              <span className={styles.navExternal} aria-hidden="true">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                </svg>
              </span>
            )}
            {item.badge && (
              <span className={styles.navBadge}>{item.badge}</span>
            )}
          </>
        );

        if (item.external) {
          return (
            <a
              key={item.href ?? item.label}
              href={item.href ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          );
        }

        return (
          <Link
            key={item.href ?? item.label}
            href={item.href ?? "#"}
            className={className}
            aria-current={item.active ? "page" : undefined}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

function NavDropdown({ item }: { item: GlasswingNavItem }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    function onClickOutside(event: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
    }, 140);
  };

  return (
    <div
      ref={wrapRef}
      className={styles.navDropdown}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cx(
          styles.navItem,
          styles.navItemTrigger,
          item.active && styles.navItemActive,
          item.flair === "lab" && styles.navItemLab,
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {item.flair === "lab" && (
          <span className={styles.navFlair} aria-hidden="true" />
        )}
        {item.label}
        <span
          aria-hidden="true"
          className={cx(styles.caret, open && styles.caretOpen)}
        >
          ↓
        </span>
      </button>

      {open && (
        <div
          className={styles.menu}
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {item.children!.map((child) => (
            <Link
              key={child.href ?? child.label}
              href={child.href ?? "#"}
              role="menuitem"
              className={cx(
                styles.menuItem,
                child.active && styles.menuItemActive,
              )}
              aria-current={child.active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className={styles.menuItemTop}>
                {child.badge && (
                  <span className={styles.menuItemBadge}>{child.badge}</span>
                )}
                <span className={styles.menuItemLabel}>{child.label}</span>
              </span>
              {child.description && (
                <span className={styles.menuItemDesc}>{child.description}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
