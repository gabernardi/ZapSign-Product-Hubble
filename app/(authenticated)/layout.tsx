"use client";

import { useState } from "react";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import styles from "./layout.module.css";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
