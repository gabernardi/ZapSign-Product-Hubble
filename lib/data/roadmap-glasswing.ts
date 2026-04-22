import { QUARTERS } from "@/lib/data/roadmap";

const active = QUARTERS.find((q) => q.active) ?? QUARTERS[1];

export const roadmapGlasswingData = {
  topbar: {
    brand: "ZapSign | Product Hubble",
  },

  hero: {
    eyebrow: `${active.period} · Trimestre atual`,
    title: `Roadmap ${active.label}.`,
    subtitle:
      "Cinco squads, um trimestre e um mesmo contrato: escopo fechado, métrica combinada, aprendizado registrado.",
    continueLabel: "Continuar lendo",
  },

  introduction: {
    label: "Introdução",
    paragraphs: [
      `O roadmap do ${active.label} não é uma lista de entregas. É um acordo público sobre o que o time se compromete a aprender nos próximos três meses — e sobre o que escolheu não fazer para proteger esse aprendizado.`,
      "Ele é escrito para ser lido por qualquer pessoa da empresa. Não porque todas precisam acompanhar cada card, mas porque a clareza sobre onde estamos investindo é o que permite que decisões de vendas, suporte, marketing e operação fiquem alinhadas sem reuniões adicionais.",
      "Cada squad recebeu a mesma instrução: escolher poucas apostas, escrever a métrica que mede se a aposta valeu, e entregar no tamanho certo — não maior, não menor. O que segue é o retrato desse trimestre, squad por squad.",
    ],
  },

  context: {
    label: "O momento",
    paragraphs: [
      active.summary ??
        "Este trimestre combina entregas de produção com discovery direcionado. A ambição é executar o que já está maduro sem sacrificar a profundidade de investigação nas apostas ainda em aberto.",
      "A leitura do trimestre anterior informa a escolha. Onde houve meta cumprida — como Upmarket e Growth no 1T26 — o foco é continuidade e aprofundamento. Onde houve bloqueio — como a migração de Pagarme na Expansion — o Q2 desbloqueia e entrega o próximo fluxo crítico.",
      "A Plataforma v2 é a espinha transversal do trimestre: seis fluxos que atravessam todos os squads e consolidam a próxima geração da experiência. Ela não é um projeto de um squad só — é o contrato comum que cada squad ajuda a completar.",
    ],
  },

  principles: {
    label: "Os cinco princípios",
    intro:
      "Antes de olhar para o que cada squad faz, vale recolocar como o time decide o que faz. Estes são os cinco princípios que presidiram o desenho deste roadmap — e que devem guiar qualquer renegociação ao longo do trimestre.",
    items: [
      {
        number: "01",
        name: "Triagem com responsabilidades claras",
        duration: "Princípio",
        body: "Design, Produto e Engenharia têm papéis bem definidos em cada processo, com um único dono em cada etapa. Triagem é decisão — e decisão tem responsável.",
        highlights: [
          "Cada processo tem um dono identificável por nome.",
          "Dúvida sobre papel é sinal de triagem incompleta.",
          "Decisões ambíguas não chegam ao backlog.",
        ],
      },
      {
        number: "02",
        name: "Projetos estruturados desde o início",
        duration: "Princípio",
        body: "Nenhum projeto entra em desenvolvimento sem escopo, objetivo e métrica de sucesso definidos. Se não dá para medir, não entra na priorização.",
        highlights: [
          "Escopo, meta e métrica escritos antes do primeiro commit.",
          "Iniciativas sem métrica voltam para o Upstream.",
          "Priorização usa o mesmo vocabulário em todos os squads.",
        ],
      },
      {
        number: "03",
        name: "Decisões baseadas em dados",
        duration: "Princípio",
        body: "Antes de construir, validamos a hipótese. Depois de lançar, medimos o resultado. Os dados guiam a próxima iteração — não a opinião mais alta da sala.",
        highlights: [
          "Hipótese validada antes do build.",
          "Resultado comparado à meta em até duas semanas.",
          "Aprendizado registrado para o próximo ciclo.",
        ],
      },
      {
        number: "04",
        name: "Lançamentos com foco em engajamento",
        duration: "Princípio",
        body: "Cada entrega inclui uma estratégia de ativação. Lançar não é só subir para produção — é garantir que as pessoas certas usem, no momento certo, com o entendimento certo.",
        highlights: [
          "Plano de ativação antes do rollout.",
          "CS e Suporte informados antes do primeiro usuário.",
          "Métrica de adoção acompanhada em D1, D7 e D30.",
        ],
      },
      {
        number: "05",
        name: "Mais perto dos clientes",
        duration: "Princípio",
        body: "Discovery é rotina, não exceção. Conversas frequentes com clientes e processos consistentes para capturar insights alimentam o trimestre atual e os próximos.",
        highlights: [
          "Ciclo contínuo de conversas com clientes.",
          "Padrão único para registrar aprendizados.",
          "Sinais silenciosos de Suporte tratados como evidência.",
        ],
      },
    ],
  },

  intermission: {
    kind: "river" as const,
    eyebrow: "Metáfora",
    title: "A mesma correnteza",
    body: "Cinco squads, cinco braços do mesmo rio. O trimestre não é a soma de cinco roadmaps — é um curso único que precisa chegar inteiro ao outro lado.",
  },

  quarters: {
    label: "O ano em perspectiva",
    intro:
      "O trimestre ativo se lê melhor ao lado dos que o antecedem e dos que o sucedem. Abaixo, a linha completa do ano em curso, com o foco de cada janela.",
    items: QUARTERS.map((q) => ({
      id: q.id,
      label: q.label,
      period: q.period,
      active: q.active,
      note: q.active
        ? "Trimestre em execução"
        : q.id < active.id
          ? "Já encerrado"
          : "Próximo na linha",
    })),
  },

  squadsSection: {
    label: `Squads · ${active.label}`,
    intro:
      "Cada squad opera o próprio trio (PM, Tech Lead e time de engenharia) e responde por um recorte do produto. O que segue é o retrato objetivo de cada um: contexto, metas, time e portfólio do trimestre.",
    items: active.squads.map((squad) => ({
      id: squad.id,
      name: squad.name,
      context: squad.context,
      people: {
        pm: squad.pm,
        tl: squad.tl,
        devs: squad.devs,
      },
      goals: squad.goals,
      projects: squad.projects,
    })),
  },

  platform: {
    label: "Plataforma v2",
    intro:
      "A Plataforma v2 é o fio que atravessa o trimestre. Seis fluxos — do login ao gerenciamento de documentos — consolidam a próxima geração da experiência. Cada fluxo tem um squad responsável; todos compartilham a mesma barra de progresso.",
    flows: active.platformV2.map((flow) => {
      const squad = active.squads.find((s) => s.id === flow.squadId);
      return {
        id: flow.id,
        name: flow.name,
        squadName: squad?.name ?? "—",
        progress: flow.progress,
        status: flow.status,
      };
    }),
  },

  appendix: {
    label: "Appendix",
    footnotes: [
      {
        number: "1",
        html: '<strong>Status</strong>. <em>Discovery</em> investiga o problema; <em>Design</em> desenha e valida a solução; <em>Development</em> constrói em sprint; <em>Produção</em> está disponível para clientes; <em>Condicional</em> depende de uma decisão externa; <em>Backlog</em> é reconhecido, mas não começado neste trimestre.',
      },
      {
        number: "2",
        html: '<strong>Continuação</strong>. Projetos marcados como continuação vêm do trimestre anterior. A regra é: se o valor ainda existe e a hipótese se mantém, continuamos. Se mudou, reescrevemos o ponto de partida antes de prosseguir.',
      },
      {
        number: "3",
        html: '<strong>Metas do squad</strong>. São três no máximo, escritas com número e unidade. Se uma meta não cabe em uma linha, ela ainda não foi trabalhada o suficiente para entrar no roadmap.',
      },
      {
        number: "4",
        html: '<strong>Plataforma v2</strong>. Conjunto de seis fluxos que, juntos, formam a próxima geração do produto. O progresso é compartilhado entre squads; a responsabilidade final de cada fluxo é do squad indicado.',
      },
    ],
  },

  footer: {
    quote: "O que fica de fora do roadmap também é decisão.",
    brand: "ZapSign · Time de Produto",
    meta: `${active.label} · ${active.period}`,
  },
};

export type RoadmapGlasswingData = typeof roadmapGlasswingData;
