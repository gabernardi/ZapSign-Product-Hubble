"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./dashboard.module.css";

const GUIDES = [
  {
    title: "Upstream",
    description:
      "Como o time de produto investiga problemas e concebe soluções antes do build.",
    href: "/dashboard/upstream",
    status: "active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4v16M12 4l5 5M12 4L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "blue",
  },
  {
    title: "Downstream",
    description:
      "Como o time transforma protótipos validados em entregas com qualidade e impacto medido.",
    href: "/dashboard/downstream",
    status: "active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 20V4M12 20l5-5M12 20l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "green",
  },
  {
    title: "Liderança",
    description:
      "Comunicação, times e desenvolvimento pessoal para quem lidera em produto e engenharia.",
    href: "/dashboard/management-tips",
    status: "active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a5 5 0 015 5v1a5 5 0 01-10 0V8a5 5 0 015-5z" stroke="currentColor" strokeWidth="2" />
        <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    color: "amber",
  },
  {
    title: "Roadmap",
    description:
      "Visão consolidada das iniciativas planejadas por trimestre — projetos, apostas e oportunidades.",
    href: "/dashboard/roadmap",
    status: "active" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
        <path d="M9 4v6M15 4v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 14h3M14 14h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    color: "teal",
  },
  {
    title: "Árvore de Oportunidades",
    description:
      "Mapeie e priorize oportunidades de produto de forma visual e estruturada.",
    href: "/dashboard/opportunity-tree",
    status: "coming" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v4L6 14M12 12l6 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    color: "purple",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {firstName ? `${getGreeting()}, ${firstName}` : "Guidelines de Produto"}
        </h1>
        <p className={styles.subtitle}>
          Guias de processo, frameworks e ferramentas para o time de Produto.
        </p>
      </div>

      <div className={styles.grid}>
        {GUIDES.map((guide, i) => {
          const isComing = guide.status === "coming";

          const content = (
            <>
              <div className={styles.cardIcon}>{guide.icon}</div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitleRow}>
                  <h2 className={styles.cardTitle}>{guide.title}</h2>
                  {isComing && (
                    <span className={styles.badge}>Em breve</span>
                  )}
                </div>
                <p className={styles.cardDesc}>{guide.description}</p>
              </div>
              {!isComing && (
                <div className={styles.arrow}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </>
          );

          if (isComing) {
            return (
              <div
                key={guide.href}
                className={`${styles.card} ${styles[guide.color]} ${styles.coming} animate-fade-up stagger-${i + 1}`}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={guide.href}
              href={guide.href}
              className={`${styles.card} ${styles[guide.color]} animate-fade-up stagger-${i + 1}`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
