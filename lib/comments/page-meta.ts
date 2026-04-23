/**
 * Mapeia pageId -> { label, section } para uso na inbox global.
 */

const COMMENT_PAGE_META: Record<string, { label: string; section: string }> = {
  "/dashboard": { label: "Dashboard", section: "Workspace" },
  "/dashboard/upstream": { label: "Upstream", section: "Guidelines" },
  "/dashboard/downstream": { label: "Downstream", section: "Guidelines" },
  "/dashboard/papeis": {
    label: "Papéis & Responsabilidades",
    section: "Guidelines",
  },
  "/dashboard/roadmap": { label: "Roadmap", section: "Roadmap" },
  "/dashboard/contribuir": {
    label: "Laboratório",
    section: "Laboratório",
  },
  "/dashboard/changelog": { label: "Changelog", section: "Laboratório" },
  "/dashboard/management-tips": {
    label: "Liderança",
    section: "Processo",
  },
};

export function pageMeta(pageId: string): { label: string; section: string } {
  if (pageId.startsWith("/dashboard/roadmap/")) {
    const quarter = pageId.split("/").pop()?.toUpperCase() ?? "Roadmap";
    return {
      label: `Roadmap ${quarter}`,
      section: "Roadmap",
    };
  }
  return (
    COMMENT_PAGE_META[pageId] ?? {
      label: pageId.replace("/dashboard/", "").replaceAll("-", " "),
      section: "Outras páginas",
    }
  );
}
