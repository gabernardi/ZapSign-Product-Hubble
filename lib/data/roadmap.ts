export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  owner?: string;
  opportunityIds?: string[];
  caveat?: string;
}

export interface RoadmapGroup {
  id: "downstream" | "upstream";
  items: RoadmapItem[];
}

export interface RoadmapSection {
  id: string;
  title: string;
  narrative: string;
  groups: RoadmapGroup[];
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
}

export interface RoadmapQuarter {
  id: string;
  label: string;
  period: string;
  active: boolean;
  summary?: string;
  compliance: ComplianceItem[];
  sections: RoadmapSection[];
}

export const QUARTERS: RoadmapQuarter[] = [
  {
    id: "1T26",
    label: "1T26",
    period: "Jan – Mar 2026",
    active: false,
    compliance: [],
    sections: [],
  },
  {
    id: "2T26",
    label: "2T26",
    period: "Abr – Jun 2026",
    active: true,
    summary:
      "Entrega dos fluxos core da Plataforma v2, investigação do vertical de Background Check e validação de apostas em LATAM e canais alternativos de assinatura.",
    compliance: [
      {
        id: "reg-001",
        title: "CNPJ Alfanumérico",
        description: "Adequação ao novo formato da Receita Federal.",
      },
      {
        id: "reg-002",
        title: "Certificado SerproID",
        description: "Assinatura digital ICP-Brasil via certificado em nuvem.",
      },
    ],
    sections: [
      {
        id: "platform-v2",
        title: "Plataforma v2",
        narrative:
          "Redesign iniciado no 1T26. Fluxos core em build; áreas adjacentes em investigação com usuários.",
        groups: [
          {
            id: "downstream",
            items: [
              {
                id: "v2-001",
                title: "Camadas compartilhadas",
                description:
                  "Sidebar, navbar, footer e navegação global.",
              },
              {
                id: "v2-002",
                title: "Fluxo de assinatura",
                description:
                  "Redesign completo com revisão das autenticações avançadas.",
                opportunityIds: [
                  "OPP-001-0",
                  "OPP-001-1",
                  "OPP-005-0",
                  "OPP-029-1",
                ],
              },
              {
                id: "v2-003",
                title: "Criação de documento",
                description:
                  "Novo fluxo de criação e envio para casos simples e avançados.",
                opportunityIds: ["OPP-013-0", "OPP-015-0"],
              },
              {
                id: "v2-004",
                title: "Gestão de documentos",
                description:
                  "Listagem, filtros e organização para operações de volume.",
                owner: "Débora Harumi Tamashiro",
                opportunityIds: ["OPP-014-0", "OPP-003-1"],
              },
              {
                id: "v2-005",
                title: "Checkout",
                description: "Novo fluxo de compra e upgrade de plano.",
                opportunityIds: ["OPP-009-0"],
                caveat: "Início no 2T26, conclusão no 3T26",
              },
            ],
          },
          {
            id: "upstream",
            items: [
              {
                id: "v2-006",
                title: "Planos e preços in-app",
                description:
                  "Comparação e visualização de planos dentro da plataforma.",
                opportunityIds: [
                  "OPP-008-0",
                  "OPP-026-0",
                  "OPP-026-1",
                  "OPP-026-2",
                ],
              },
              {
                id: "v2-007",
                title: "Consulta de antecedentes",
                description:
                  "BG Check integrado à jornada de assinatura.",
                opportunityIds: ["OPP-032-0"],
              },
              {
                id: "v2-008",
                title: "Modelos e formulários",
                description:
                  "Modelos dinâmicos e formulários pré-assinatura.",
                opportunityIds: ["OPP-011-0", "OPP-012-0", "OPP-036-0"],
              },
              {
                id: "v2-009",
                title: "Detalhes de documento",
                description:
                  "Informações consolidadas e ações contextuais por documento.",
                owner: "Débora Harumi Tamashiro",
                opportunityIds: ["OPP-041-0"],
              },
            ],
          },
        ],
      },
      {
        id: "bg-check",
        title: "Background Check",
        narrative:
          "Vertical em investigação. Sem commitment de delivery — validamos direção antes de investir.",
        groups: [
          {
            id: "upstream",
            items: [
              {
                id: "bg-001",
                title: "APIs de consulta",
                description:
                  "APIs para consulta de antecedentes por clientes e parceiros.",
              },
              {
                id: "bg-002",
                title: "Relatórios",
                description:
                  "Dados mais completos e exportações para enterprise.",
                opportunityIds: ["OPP-020-0"],
                caveat: "Delivery no 2T26 sob avaliação",
              },
              {
                id: "bg-003",
                title: "Plano dedicado",
                description:
                  "Plano exclusivo com features e combos de consulta.",
              },
            ],
          },
        ],
      },
      {
        id: "bets",
        title: "Apostas",
        narrative:
          "Alto impacto potencial, incerteza proporcional. Condicionados a sinais de mercado e discovery.",
        groups: [
          {
            id: "downstream",
            items: [
              {
                id: "bet-003",
                title: "Troca de forma de pagamento",
                description:
                  "Self-service para trocar método de pagamento e desincentivar boleto.",
                opportunityIds: ["OPP-016-0", "OPP-017-0"],
              },
              {
                id: "bet-005",
                title: "Certificado digital LATAM",
                description:
                  "Certificados locais para validade jurídica plena.",
                opportunityIds: ["OPP-021-0", "OPP-021-1"],
              },
              {
                id: "bet-006",
                title: "Expansão Chile",
                description:
                  "Condicionada ao fechamento de deals enterprise.",
                opportunityIds: ["OPP-021-1"],
                caveat: "Alta probabilidade",
              },
            ],
          },
          {
            id: "upstream",
            items: [
              {
                id: "bet-001",
                title: "Assinatura offline",
                description:
                  "Assinar sem internet via app mobile.",
                opportunityIds: ["OPP-001-0"],
              },
              {
                id: "bet-002",
                title: "Assinatura via WhatsApp",
                description: "Assinar sem sair do WhatsApp.",
                opportunityIds: ["OPP-007-0"],
              },
              {
                id: "bet-004",
                title: "Simplificação dos planos LATAM",
                description:
                  "Reestruturação dos planos para mercados fora do Brasil.",
                opportunityIds: ["OPP-009-1"],
              },
              {
                id: "bet-007",
                title: "México",
                description:
                  "Exploração com suporte a e.firma e carimbo de tempo.",
                opportunityIds: ["OPP-021-2", "OPP-021-3"],
                caveat: "Baixa probabilidade no 2T26",
              },
              {
                id: "bet-008",
                title: "E-mail com domínio próprio",
                description:
                  "Envio de documentos usando o domínio do cliente.",
                opportunityIds: ["OPP-006-0"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "3T26",
    label: "3T26",
    period: "Jul – Set 2026",
    active: false,
    compliance: [],
    sections: [],
  },
  {
    id: "4T26",
    label: "4T26",
    period: "Out – Dez 2026",
    active: false,
    compliance: [],
    sections: [],
  },
];
