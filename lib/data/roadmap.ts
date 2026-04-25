export type SquadId =
  | "upmarket"
  | "expansion"
  | "growth"
  | "retencion"
  | "sustentacion";

export type SquadAccent = "blue" | "teal" | "purple" | "amber" | "green";

export type ProjectStatus =
  | "development"
  | "design"
  | "discovery"
  | "blocked"
  | "validated"
  | "conditional"
  | "production"
  | "backlog";

export interface RoadmapPrinciple {
  number: string;
  title: string;
  body: string;
}

export interface RoadmapGoal {
  value: string;
  label: string;
}

export interface RoadmapProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  continuation?: boolean;
}

export interface RoadmapSquad {
  id: SquadId;
  name: string;
  accent: SquadAccent;
  pm: string;
  tl: string;
  devs: string[];
  context: string;
  goals: RoadmapGoal[];
  projects: RoadmapProject[];
}

export interface PlatformV2Flow {
  id: string;
  name: string;
  squadId: SquadId;
  progress: number;
  status: ProjectStatus;
}

export interface RoadmapQuarter {
  id: string;
  label: string;
  period: string;
  active: boolean;
  /**
   * Disponível para leitura no menu/roadmap. Permite listar trimestres
   * encerrados cujo formato difere do plano trimestral (ex.: retrospectivas).
   */
  published?: boolean;
  /** URL canônica do trimestre. */
  href?: string;
  summary?: string;
  principles: RoadmapPrinciple[];
  squads: RoadmapSquad[];
  platformV2: PlatformV2Flow[];
}

const Q2_PRINCIPLES: RoadmapPrinciple[] = [
  {
    number: "01",
    title: "Triagem com responsabilidades claras",
    body: "Responsabilidades claras entre design, produto e engenharia, com um único dono em cada processo.",
  },
  {
    number: "02",
    title: "Projetos estruturados desde o início",
    body: "Nenhum projeto começa sem escopo, objetivo e métricas de sucesso definidos. Se não dá para medir, não entra na priorização.",
  },
  {
    number: "03",
    title: "Decisões baseadas em dados",
    body: "Antes de construir, validamos a hipótese. Depois de lançar, medimos o resultado. Os dados guiam a próxima iteração.",
  },
  {
    number: "04",
    title: "Lançamentos com foco em engajamento",
    body: "Cada entrega inclui uma estratégia de ativação. Lançar não é só subir para produção — é garantir que as pessoas usem.",
  },
  {
    number: "05",
    title: "Mais perto dos clientes",
    body: "Discovery como rotina, não como exceção. Conversas frequentes com clientes e processos consistentes para capturar insights.",
  },
];

const Q2_SQUADS: RoadmapSquad[] = [
  {
    id: "upmarket",
    name: "Upmarket",
    accent: "blue",
    pm: "Maiara",
    tl: "Rafa",
    devs: ["Sakamoto", "Muto", "Enzo", "Pedro"],
    context:
      "Q1 fechou com 100% da meta. O Q2 mira +55% de crescimento de clientes enterprise. O fluxo de assinatura e a assinatura dentro do WhatsApp são as grandes apostas.",
    goals: [
      { value: "155 → 240", label: "Clientes enterprise" },
      { value: "100%", label: "Fluxo de assinatura em produção" },
    ],
    projects: [
      {
        id: "up-001",
        title: "Fluxo de assinatura v2 — Produção",
        description:
          "Continuação do Q1. Finalizar desenvolvimento e ir para produção. Foco em performance e UX mobile. Escopo fechado — sem melhorias de backend não bloqueantes.",
        status: "development",
        continuation: true,
      },
      {
        id: "up-002",
        title: "Logs de usuários — Disponível na plataforma web",
        description:
          "Completar o registro de eventos de conta (mudanças de config, usuários, permissões) e expor na plataforma.",
        status: "development",
        continuation: true,
      },
      {
        id: "up-003",
        title: "Assinatura dentro do WhatsApp",
        description:
          "Signatários completam a assinatura sem sair do WhatsApp. Discovery técnico e validação com clientes antes de comprometer o desenvolvimento.",
        status: "discovery",
      },
    ],
  },
  {
    id: "expansion",
    name: "Expansion",
    accent: "teal",
    pm: "Lury",
    tl: "Santiago",
    devs: ["Carlos", "Adriana", "Samuel", "Veronica"],
    context:
      "Pagarme v5 ficou em 5% — a migração dos clientes existentes foi mais complexa do que o esperado. O Q2 desbloqueia pagamentos e avança no fluxo mais crítico da plataforma: a criação de documentos, com conclusão e lançamento previstos até o 3T26.",
    goals: [
      { value: "Lançamento até 3T26", label: "Fluxo de criação de documento" },
      { value: "100%", label: "Migração Pagarme" },
    ],
    projects: [
      {
        id: "ex-001",
        title: "Criação de documentos v2 — Produção",
        description:
          "O fluxo mais crítico. Protótipo validado com clientes reais. Objetivo: concluir o desenvolvimento no 2T26 e lançar em produção até o 3T26.",
        status: "development",
      },
      {
        id: "ex-002",
        title: "Automação de overage",
        description:
          "Cobrança automática quando um cliente ultrapassa os documentos do plano, eliminando gestão manual.",
        status: "development",
      },
      {
        id: "ex-003",
        title: "Protótipo validado — Modelos e formulários",
        description:
          "Desenhar e validar o fluxo de modelos e formulários. Entregável: protótipo aprovado para desenvolvimento no Q3.",
        status: "design",
      },
      {
        id: "ex-004",
        title: "Assinatura com certificado digital Chile",
        description:
          "Pendente de confirmação de cliente. Ampliaria a cobertura no Chile com assinatura avançada.",
        status: "conditional",
      },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    accent: "purple",
    pm: "Mariana",
    tl: "Thiago",
    devs: ["Pedro", "Gabriel", "Bruno"],
    context:
      "Q1 sólido: 118% em conversão. O Q2 expande o escopo para nível global, o que exige adaptar planos, checkout e paywalls para a LATAM.",
    goals: [
      { value: "R$ 59", label: "Ticket médio" },
      { value: "2,5%", label: "Taxa free → paid" },
    ],
    projects: [
      {
        id: "gr-001",
        title: "Planos e Preços v2 — Produção",
        description:
          "Redesign do fluxo de planos. Principal motivo de contato com o suporte.",
        status: "development",
        continuation: true,
      },
      {
        id: "gr-002",
        title: "Checkout v2 — Produção",
        description:
          "Novo fluxo de compra para reduzir fricção e aumentar conversão.",
        status: "development",
        continuation: true,
      },
      {
        id: "gr-003",
        title: "Gestão de assinatura v2 — Produção",
        description:
          "Página em que o cliente vê o que o plano oferece, gerencia informações de pagamento e adiciona add-ons e créditos.",
        status: "design",
        continuation: true,
      },
      {
        id: "gr-004",
        title: "Mudança de planos v2 — Produção",
        description:
          "Cliente gerencia o plano sem precisar cancelar e recomprar.",
        status: "blocked",
      },
      {
        id: "gr-005",
        title: "Planos LATAM adaptados à estrutura BR",
        description:
          "Adaptar estrutura de planos para CO, MX, PE, CL e AR.",
        status: "design",
      },
      {
        id: "gr-006",
        title: "Definição de paywalls",
        description:
          "Pontos de conversão com CTA claro para upgrade dentro da plataforma.",
        status: "development",
      },
    ],
  },
  {
    id: "retencion",
    name: "Retenção",
    accent: "amber",
    pm: "Débora",
    tl: "Adoglio",
    devs: ["Monique", "Isabella", "Renzo"],
    context:
      "O squad focou em melhorar latência da plataforma e em atualizações-chave como Angular e Django/Python. O Q2 tem portfólio balanceado entre a v2, redução de tickets de suporte e discovery da aposta em Antecedentes.",
    goals: [
      { value: "100%", label: "Listar documentos em produção" },
      { value: "Redução", label: "Tickets de suporte" },
    ],
    projects: [
      {
        id: "re-001",
        title: "Gestão de documentos v2 — Produção",
        description:
          "Visão clara dos documentos criados para facilitar a gestão. Busca, organização e outras ações.",
        status: "development",
        continuation: true,
      },
      {
        id: "re-002",
        title: "Desincentivo ao boleto bancário",
        description:
          "O boleto é o principal motivo de contato com o suporte. Orientar clientes para métodos mais eficientes (cartão, PIX).",
        status: "development",
      },
      {
        id: "re-003",
        title: "Troca de método de pagamento",
        description:
          "Cliente atualiza o método de pagamento pela plataforma sem cancelar e recomprar o plano.",
        status: "design",
      },
      {
        id: "re-004",
        title: "Discovery de Antecedentes",
        description:
          "Investigar a baixa adoção da consulta de antecedentes. Entregável: brief com proposta de melhorias para o Q3.",
        status: "discovery",
      },
    ],
  },
  {
    id: "sustentacion",
    name: "Sustentação",
    accent: "green",
    pm: "Amanda",
    tl: "Diene",
    devs: ["Harold", "Malu", "Matheus"],
    context:
      "No Q1 o squad estruturou visibilidade, categorização e governança, com resultados já visíveis no começo do Q2. No Q2 o foco é execução: atuar em causa raiz, reduzir reincidência e melhorar o TTR em alinhamento com Suporte e Fundações Técnicas.",
    goals: [
      { value: "< 0,005%", label: "Bugs / cliente pagante" },
      { value: "< 15%", label: "SLA crítico violado" },
    ],
    projects: [
      {
        id: "su-001",
        title: "Atuar nas categorias dos bugs recorrentes",
        description:
          "A nova categorização dos cards permite identificar onde estão os principais problemas da plataforma. Sustentação faz a triagem e repassa ao squad responsável.",
        status: "development",
      },
      {
        id: "su-002",
        title: "Correção definitiva de bugs high/highest",
        description:
          "Bugs de alta prioridade têm SLA reduzido e geralmente recebem correção paliativa. A proposta é abrir um card novo para cada caso e atuar na correção definitiva.",
        status: "development",
      },
      {
        id: "su-003",
        title: "Reduzir cancelamentos em desenvolvimento",
        description:
          "1 em cada 3 bugs é cancelado durante o desenvolvimento por falha na triagem, consumindo tempo de engenharia. Melhorar triagem e escalonamento.",
        status: "discovery",
      },
    ],
  },
];

const Q2_PLATFORM_V2: PlatformV2Flow[] = [
  {
    id: "v2-signin",
    name: "Criação de conta e login",
    squadId: "growth",
    progress: 100,
    status: "production",
  },
  {
    id: "v2-sign",
    name: "Fluxo de assinatura",
    squadId: "upmarket",
    progress: 50,
    status: "development",
  },
  {
    id: "v2-create",
    name: "Criação de documentos",
    squadId: "expansion",
    progress: 1,
    status: "development",
  },
  {
    id: "v2-manage",
    name: "Gestão de documentos",
    squadId: "retencion",
    progress: 70,
    status: "design",
  },
  {
    id: "v2-pricing",
    name: "Planos e Preços / Checkout",
    squadId: "growth",
    progress: 50,
    status: "design",
  },
  {
    id: "v2-templates",
    name: "Modelos e formulários",
    squadId: "expansion",
    progress: 0,
    status: "backlog",
  },
];

export const QUARTERS: RoadmapQuarter[] = [
  {
    id: "1T26",
    label: "1T26",
    period: "Jan – Mar 2026",
    active: false,
    published: true,
    href: "/dashboard/roadmap/1t26",
    summary:
      "Trimestre fechado. Retrospectiva por entregas, resultados e aprendizados — o que sustenta as apostas do 2T26.",
    principles: [],
    squads: [],
    platformV2: [],
  },
  {
    id: "2T26",
    label: "2T26",
    period: "Abr – Jun 2026",
    active: true,
    published: true,
    href: "/dashboard/roadmap",
    summary:
      "Cinco squads com metas claras, escopo fechado e lançamento dos fluxos core da Plataforma v2. O trimestre combina entregas de produção (assinatura, criação de documentos, planos e checkout) com discovery direcionado para WhatsApp e Antecedentes.",
    principles: Q2_PRINCIPLES,
    squads: Q2_SQUADS,
    platformV2: Q2_PLATFORM_V2,
  },
  {
    id: "3T26",
    label: "3T26",
    period: "Jul – Set 2026",
    active: false,
    principles: [],
    squads: [],
    platformV2: [],
  },
  {
    id: "4T26",
    label: "4T26",
    period: "Out – Dez 2026",
    active: false,
    principles: [],
    squads: [],
    platformV2: [],
  },
];
