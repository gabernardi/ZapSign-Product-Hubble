import type { GlasswingNavItem } from "@/components/glasswing/GlasswingShell";
import { QUARTERS } from "@/lib/data/roadmap";

type ActiveKey =
  | "upstream"
  | "downstream"
  | "papeis"
  | "roadmap"
  | "home"
  | "contribuir"
  | "changelog";

export function getGlasswingNav(
  active: ActiveKey = "home",
  activeQuarterId?: string,
): GlasswingNavItem[] {
  const isGuideline =
    active === "upstream" ||
    active === "downstream" ||
    active === "papeis";

  const publishedQuarters = QUARTERS.filter(
    (q) => q.published || q.squads.length > 0,
  );

  return [
    {
      label: "Guidelines",
      active: isGuideline,
      children: [
        {
          label: "Upstream",
          href: "/dashboard/upstream",
          active: active === "upstream",
          description: "Como o trio formula, valida e prepara o que será construído.",
        },
        {
          label: "Downstream",
          href: "/dashboard/downstream",
          active: active === "downstream",
          description: "Como o trio executa, lança e aprende com o que foi construído.",
        },
        {
          label: "Papéis & Responsabilidades",
          href: "/dashboard/papeis",
          active: active === "papeis",
          description:
            "Quem decide o quê, com quem e em que momento — PM, Design, TL, EM e Engineers.",
        },
      ],
    },
    {
      label: "Roadmap",
      active: active === "roadmap",
      children: publishedQuarters.map((quarter) => ({
        label: quarter.label,
        href: quarter.href ?? "/dashboard/roadmap",
        active:
          active === "roadmap" &&
          (activeQuarterId ? activeQuarterId === quarter.id : quarter.active),
        description: quarter.period,
      })),
    },
    {
      label: "Laboratório",
      active: active === "contribuir" || active === "changelog",
      flair: "lab",
      children: [
        {
          label: "Sobre o laboratório",
          href: "/dashboard/contribuir",
          active: active === "contribuir",
          description:
            "Como o laboratório funciona — princípios, fluxo e convites.",
        },
        {
          label: "Changelog",
          href: "/dashboard/changelog",
          active: active === "changelog",
          badge: "LAB-001",
          description:
            "Histórico automatizado gerado dos commits da main.",
        },
      ],
    },
  ];
}
