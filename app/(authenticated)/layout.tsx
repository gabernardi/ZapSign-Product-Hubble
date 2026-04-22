"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import styles from "./layout.module.css";

const FULL_BLEED_ROUTES = [
  "/dashboard",
  "/dashboard/downstream",
  "/dashboard/upstream",
  "/dashboard/roadmap",
  "/dashboard/contribuir",
  "/dashboard/changelog",
];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isFullBleed = FULL_BLEED_ROUTES.includes(pathname);

  if (isFullBleed) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
