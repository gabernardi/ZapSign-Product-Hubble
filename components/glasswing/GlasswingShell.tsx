import Link from "next/link";
import styles from "./GlasswingShell.module.css";
import { GlasswingNav } from "./GlasswingNav";
import { GlasswingUserMenu } from "./GlasswingUserMenu";

export interface GlasswingNavItem {
  label: string;
  href?: string;
  active?: boolean;
  description?: string;
  badge?: string;
  flair?: "lab";
  children?: GlasswingNavItem[];
}

interface GlasswingShellProps {
  brand: string;
  navItems?: GlasswingNavItem[];
  children: React.ReactNode;
}

export function GlasswingShell({
  brand,
  navItems = [],
  children,
}: GlasswingShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/dashboard" className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zapsign-mark-white.png"
              alt=""
              className={styles.brandMark}
            />
            <span className={styles.brandText}>{renderBrand(brand)}</span>
          </Link>

          <div className={styles.rightCluster}>
            {navItems.length > 0 && <GlasswingNav items={navItems} />}
            <GlasswingUserMenu />
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

// Renders a brand string, giving the "company | product" form typographic
// hierarchy: the separator is de-emphasized and the company / product halves
// can carry their own weight.
function renderBrand(brand: string) {
  const idx = brand.indexOf("|");
  if (idx === -1) return brand;
  const company = brand.slice(0, idx).trim();
  const product = brand.slice(idx + 1).trim();
  return (
    <>
      <span className={styles.brandCompany}>{company}</span>
      <span className={styles.brandSep} aria-hidden="true">
        |
      </span>
      <span className={styles.brandProduct}>{product}</span>
    </>
  );
}
