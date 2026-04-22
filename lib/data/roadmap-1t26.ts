import { QUARTERS } from "@/lib/data/roadmap";

/**
 * Conteúdo editorial da retrospectiva do 1T26.
 *
 * O trimestre já está encerrado. Diferente dos trimestres em execução,
 * aqui a narrativa é organizada em torno de:
 *   - Resultados (metas numéricas do trimestre)
 *   - Entregas (projetos concluídos ou em curso por área)
 *   - Aprendizados (o que funcionou e os retos)
 *   - Continuações (projetos que seguem no 2T26)
 */

const quarter = QUARTERS.find((q) => q.id === "1T26")!;

export type ResultStatus = "met" | "partial" | "missed";

export interface QuarterResult {
  squad: string;
  metric: string;
  from: string;
  to: string;
  attainment: number;
  status: ResultStatus;
  note?: string;
}

export type DeliveryStatus =
  | "production"
  | "in_progress"
  | "validated"
  | "impact";

export interface QuarterDelivery {
  id: string;
  theme: string;
  title: string;
  description: string;
  status: DeliveryStatus;
  unplanned?: boolean;
}

export interface DeliveryGroup {
  id: string;
  title: string;
  subtitle: string;
  items: QuarterDelivery[];
}

export interface ContinuationProject {
  squad: string;
  title: string;
  description: string;
}

const RESULTS: QuarterResult[] = [
  {
    squad: "Upmarket",
    metric: "Clientes enterprise",
    from: "112",
    to: "155",
    attainment: 100,
    status: "met",
  },
  {
    squad: "Expansion",
    metric: "Migração Pagarme v5",
    from: "0%",
    to: "5%",
    attainment: 5,
    status: "missed",
    note: "Migração mais complexa do que o estimado. Segue no 2T26.",
  },
  {
    squad: "Growth",
    metric: "Taxa free → paid",
    from: "1,97%",
    to: "2,2%",
    attainment: 118,
    status: "met",
  },
  {
    squad: "Growth",
    metric: "Ticket médio",
    from: "R$ 54",
    to: "R$ 56,2",
    attainment: 97,
    status: "partial",
  },
  {
    squad: "Retención",
    metric: "NetSuite em produção",
    from: "80%",
    to: "100%",
    attainment: 100,
    status: "met",
  },
  {
    squad: "Retención",
    metric: "Endpoints com tempo médio < 5s",
    from: "7",
    to: "6",
    attainment: 50,
    status: "partial",
  },
  {
    squad: "Sustentação",
    metric: "Bugs / clientes pagantes",
    from: "0,008%",
    to: "0,006%",
    attainment: 83,
    status: "partial",
    note: "Base de cálculo ajustada no trimestre; o indicador segue em monitoramento.",
  },
  {
    squad: "Sustentação",
    metric: "SLA de alta prioridade",
    from: "32%",
    to: "31,2%",
    attainment: 48,
    status: "partial",
    note: "Categorização de tickets evoluiu ao longo do trimestre.",
  },
];

const DELIVERY_GROUPS: DeliveryGroup[] = [
  {
    id: "design-produto",
    title: "Design e Produto",
    subtitle: "Experiência do usuário, Plataforma v2 e expansão geográfica",
    items: [
      {
        id: "dp-01",
        theme: "Plataforma v2",
        title: "Sign in e Sign up",
        description:
          "Primeiro fluxo da v2 em produção. Novo funil de criação de conta, com aprendizados-chave sobre o processo de deploy.",
        status: "production",
      },
      {
        id: "dp-02",
        theme: "Plataforma v2",
        title: "Emails transacionais",
        description:
          "Redesign completo dos emails para signatários e usuários, alinhado ao novo sistema visual.",
        status: "production",
      },
      {
        id: "dp-03",
        theme: "Plataforma v2",
        title: "Site com novo design",
        description:
          "Site público atualizado com o rebranding. Operação atual sob responsabilidade do time de marketing.",
        status: "production",
      },
      {
        id: "dp-04",
        theme: "Plataforma v2",
        title: "Design System — 26% concluído",
        description:
          "Base de componentes reutilizáveis. 26% concluído e 23% em progresso. Habilita velocidade de desenvolvimento nos próximos trimestres.",
        status: "in_progress",
      },
      {
        id: "dp-05",
        theme: "Plataforma v2",
        title: "Protótipo de criação de documento",
        description:
          "O fluxo mais crítico da plataforma, validado com clientes reais. Pronto para iniciar desenvolvimento no 2T26.",
        status: "validated",
      },
      {
        id: "dp-06",
        theme: "Plataforma v2",
        title: "Fluxo de assinatura",
        description:
          "Novo fluxo validado com usuários e em desenvolvimento ativo. Não estava priorizado no 1T26 e entrou em resposta ao contexto.",
        status: "in_progress",
        unplanned: true,
      },
      {
        id: "dp-07",
        theme: "Clientes LATAM",
        title: "Truora Counters",
        description:
          "Integração com a Truora evoluída para compartilhar dados de clientes comuns às duas empresas.",
        status: "production",
      },
      {
        id: "dp-08",
        theme: "Clientes LATAM",
        title: "Assinatura com certificado SV",
        description:
          "Desbloqueio do projeto com o Governo de El Salvador. Habilita cobertura de assinatura avançada na região.",
        status: "production",
      },
      {
        id: "dp-09",
        theme: "Clientes LATAM",
        title: "Compra de créditos LATAM",
        description:
          "Automação da compra de créditos para clientes LATAM. Reduz fricção operacional sem passar por atendimento manual.",
        status: "production",
      },
      {
        id: "dp-10",
        theme: "Clientes LATAM",
        title: "Verificação telefônica Vivo",
        description:
          "Integração com a Vivo que habilitou a participação da ZapSign em conferência na Europa.",
        status: "production",
      },
      {
        id: "dp-11",
        theme: "Clientes LATAM",
        title: "Melhorias Deceval",
        description:
          "Ajustes de estabilidade na integração com a Deceval para reduzir erros recorrentes. Não estava priorizado no trimestre.",
        status: "in_progress",
        unplanned: true,
      },
    ],
  },
  {
    id: "engenharia-operacoes",
    title: "Engenharia e Operações",
    subtitle: "Infraestrutura, pagamentos e ferramentas internas",
    items: [
      {
        id: "eo-01",
        theme: "Pagamentos",
        title: "Novos clientes em Pagarme v5",
        description:
          "Todos os novos clientes passaram a usar a versão 5 do gateway. Base instalada começa a migrar no trimestre seguinte.",
        status: "production",
      },
      {
        id: "eo-02",
        theme: "Pagamentos",
        title: "Início da migração de clientes para Pagarme v5",
        description:
          "Arranque do processo de migração da base ativa. A complexidade se mostrou maior do que a estimada — 5% concluído no trimestre.",
        status: "in_progress",
      },
      {
        id: "eo-03",
        theme: "Operações internas",
        title: "NetSuite em produção",
        description:
          "Integração financeira concluída com os ajustes acordados. 100% do objetivo do trimestre entregue.",
        status: "production",
      },
      {
        id: "eo-04",
        theme: "Operações internas",
        title: "Backoffice em produção",
        description:
          "Nova versão do backoffice operacional, adotada pela maior parte do time interno.",
        status: "production",
      },
      {
        id: "eo-05",
        theme: "Engenharia",
        title: "Refatoração do posicionamento de assinaturas",
        description:
          "Corrige um bug em que a rubrica não aparecia em documentos assinados — a 3ª maior causa de contato com suporte. Já saiu do top 15.",
        status: "impact",
      },
      {
        id: "eo-06",
        theme: "Engenharia",
        title: "Atualização de Angular e Python/Django",
        description:
          "Stack atualizado para versões mais recentes. Reduz vulnerabilidades e melhora compatibilidade com bibliotecas.",
        status: "production",
      },
      {
        id: "eo-07",
        theme: "Engenharia",
        title: "Melhorias de performance no fluxo de assinatura",
        description:
          "Otimizações que reduziram de forma relevante os tickets por problemas no fluxo de firma.",
        status: "in_progress",
      },
      {
        id: "eo-08",
        theme: "Sustentação",
        title: "Processos de sustentação",
        description:
          "Visibilidade de bugs, identificação de causa raiz e alinhamento com os demais squads. Base do trimestre para os resultados seguintes.",
        status: "in_progress",
      },
    ],
  },
];

const CONTINUATIONS: ContinuationProject[] = [
  {
    squad: "Expansion",
    title: "Migração de clientes Pagarme v5",
    description:
      "Arranque no 1T com 5% dos clientes migrados para a v5. Segue como aposta central do 2T.",
  },
  {
    squad: "Upmarket",
    title: "Logs de usuários na plataforma",
    description:
      "Rastreabilidade de ações para clientes enterprise. Parte de infraestrutura crítica para vendas upmarket.",
  },
  {
    squad: "Upmarket",
    title: "Endpoint de listagem de documentos + relatório de consumo",
    description:
      "Habilita análise de dados para clientes de API e integrações.",
  },
  {
    squad: "Growth",
    title: "Fallback de entregabilidade de emails",
    description:
      "Reduz bounce e perda de notificações críticas no fluxo de assinatura.",
  },
  {
    squad: "Growth",
    title: "Comunicações in-app",
    description:
      "Canal direto com o usuário dentro da plataforma, sem depender de email.",
  },
  {
    squad: "Retención",
    title: "Melhorias de latência de endpoints",
    description:
      "Reduz o tempo de resposta nos endpoints com maior latência da plataforma.",
  },
  {
    squad: "Retención",
    title: "Refatoração do fluxo de assinatura v1",
    description:
      "Melhorias de performance no fluxo de firma atual, enquanto a v2 amadurece.",
  },
];

export const roadmap1T26Data = {
  topbar: {
    brand: "ZapSign | Product Hubble",
  },

  hero: {
    eyebrow: `${quarter.period} · Trimestre encerrado`,
    title: `Retrospectiva ${quarter.label}.`,
    subtitle:
      "O que entregamos, o que ficou pelo caminho e o que aprendemos — o retrato honesto do trimestre que sustenta o 2T26.",
    continueLabel: "Continuar lendo",
  },

  introduction: {
    label: "Abertura",
    paragraphs: [
      "O 1T26 foi o primeiro trimestre em que o novo desenho de squads, metas e princípios rodou por inteiro. Não é um trimestre perfeito — é um trimestre honesto. Algumas metas foram batidas com folga, outras ficaram pelo caminho, e algumas entregas nem estavam no plano original e apareceram em resposta ao contexto.",
      "Esta página é o registro público do que aconteceu. Serve para três coisas: dar visibilidade a quem não acompanhou cada card, consolidar os aprendizados que alimentam o 2T26 e manter o mesmo padrão de clareza que o roadmap ativo já segue.",
      "O que vem a seguir é organizado por resultado, entrega e aprendizado — na ordem em que o trimestre se lê melhor quando olhamos para trás.",
    ],
  },

  context: {
    label: "O momento",
    paragraphs: [
      "O 1T26 foi o trimestre de estruturação. Todos os squads passaram a ter Tech Lead, os refinamentos ganharam ritmo e a Sustentação assumiu um papel próprio — com categorização de bugs, visibilidade de causa raiz e alinhamento consistente com os demais times.",
      "Do lado do produto, foi o trimestre em que a Plataforma v2 saiu do discurso e virou entregas mensuráveis: Sign in/Sign up em produção, os emails transacionais redesenhados, o site público atualizado e o Design System com 26% dos componentes prontos.",
      "Do lado do mercado, o squad Upmarket bateu 100% da meta de clientes enterprise e o squad Growth passou da meta de conversão. Em contrapartida, a migração do Pagarme v5 se mostrou mais complexa do que o esperado e entregou 5% em vez dos 100% planejados — o que desloca parte da aposta para o 2T26.",
    ],
  },

  results: {
    label: "Resultados",
    intro:
      "Oito metas para cinco squads. Cada linha abaixo é a fotografia objetiva do que se moveu — sem hype, sem maquiagem. Onde não chegamos, explicitamos o atingimento parcial; onde atingimos, seguimos para aprofundar no trimestre seguinte.",
    items: RESULTS,
  },

  deliveries: {
    label: "Entregas",
    intro:
      "As entregas do 1T26 estão organizadas por área — Design e Produto de um lado, Engenharia e Operações do outro — e dentro de cada área por tema. Projetos marcados como não previstos entraram em resposta ao contexto e não estavam no plano original.",
    groups: DELIVERY_GROUPS,
  },

  learnings: {
    label: "Aprendizados",
    intro:
      "O trimestre separou claramente o que já virou rotina saudável daquilo que ainda precisa de desenho. A lista abaixo é o material com que o 2T26 foi planejado.",
    good: {
      title: "O que funcionou",
      items: [
        "Evolução dos processos e alinhamento com design em todos os squads.",
        "Todos os squads passaram a ter Tech Lead — refinamentos mais consistentes.",
        "Visibilidade de bugs, logs e categorização abrindo caminho para atuar em causa raiz.",
        "Projetos complexos entregues com menos incidentes do que em trimestres anteriores.",
        "Criação de backlog estruturado em cada um dos squads.",
        "Primeiro fluxo da Plataforma v2 em produção — Sign in/Sign up.",
      ],
    },
    challenges: {
      title: "Retos e aprendizados",
      items: [
        "Pouca experimentação antes da construção.",
        "Organização de ativação e lançamento dos projetos ainda é informal.",
        "Muito tempo de PMs em QA e em tarefas operacionais de engenharia.",
        "Produto e design com foco excessivo em engenharia em detrimento do discovery.",
        "Documentação das entregas e decisões ainda é irregular.",
      ],
    },
  },

  intermission: {
    kind: "pulse" as const,
    eyebrow: "Balanço",
    title: "Fechar um trimestre não é apagar a luz",
    body: "É deixar os sinais certos acesos para o próximo. Cada meta batida cria confiança para aprofundar; cada meta não batida vira hipótese revista — e volta para a mesa com mais clareza.",
  },

  continuations: {
    label: "Do 1T para o 2T",
    intro:
      "Sete projetos iniciaram no 1T26 e continuam no 2T26. Cada um foi renegociado em escopo e meta antes de atravessar o corte do trimestre — continuidade não é herança automática, é decisão consciente.",
    items: CONTINUATIONS,
  },

  quarters: {
    label: "O ano em perspectiva",
    intro:
      "O 1T26 se lê melhor ao lado do trimestre que o sucede. Abaixo, a linha completa do ano — onde estivemos, onde estamos e o que ainda vem.",
    items: QUARTERS.map((q) => ({
      id: q.id,
      label: q.label,
      period: q.period,
      active: q.id === "1T26",
      note:
        q.id === "1T26"
          ? "Trimestre em leitura"
          : q.id < "1T26"
            ? "Já encerrado"
            : q.active
              ? "Em execução"
              : "Próximo na linha",
    })),
  },

  appendix: {
    label: "Appendix",
    footnotes: [
      {
        number: "1",
        html: "<strong>Atingimento</strong>. Percentual da meta alcançado ao final do trimestre. Valores acima de 100% indicam superação; valores abaixo indicam entrega parcial.",
      },
      {
        number: "2",
        html: "<strong>Status das entregas</strong>. <em>Em produção</em>: disponível para clientes. <em>Em progresso</em>: segue em desenvolvimento. <em>Validado</em>: protótipo aprovado, pronto para desenvolvimento. <em>Impacto alto</em>: mudança com efeito material em um indicador de negócio.",
      },
      {
        number: "3",
        html: "<strong>Projetos não previstos</strong>. Entregas que não constavam no plano inicial do 1T26 e entraram em resposta a demanda de cliente, contexto técnico ou compromissos comerciais assumidos durante o trimestre.",
      },
      {
        number: "4",
        html: "<strong>Continuações</strong>. Todo projeto que atravessa o corte de trimestre foi renegociado em escopo e meta. Continuidade é decisão, não inércia.",
      },
    ],
  },

  footer: {
    quote: "Fechar bem um trimestre é o que dá liberdade ao próximo.",
    brand: "ZapSign · Time de Produto",
    meta: `${quarter.label} · ${quarter.period}`,
  },
};

export type Roadmap1T26Data = typeof roadmap1T26Data;
