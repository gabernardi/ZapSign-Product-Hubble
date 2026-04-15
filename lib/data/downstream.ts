export const downstreamData = {
  header: {
    pill: "Guia de Processo · Produto",
    title: "Downstream",
    description: "Do protótipo validado à entrega medida.",
    meta: {
      label: "ZapSign · Time de Produto",
      detail: "Versão 1.0 · Março 2026",
    },
  },

  principles: [
    {
      number: "01",
      title: "Entrega é validação",
      body: "Se a métrica não se move, a entrega não acabou.",
    },
    {
      number: "02",
      title: "Qualidade é do trio",
      body: "PM, Design e Engineering dividem a responsabilidade. QA não é fase — é rotina.",
    },
    {
      number: "03",
      title: "Gradual antes de total",
      body: "Funcionalidade nova vai primeiro para poucos. Só expande quando os dados confirmam.",
    },
    {
      number: "04",
      title: "Medir antes de decidir",
      body: "Dados decidem o próximo passo. Opinião não substitui métrica.",
    },
  ],

  prerequisites: [
    {
      color: "blue" as const,
      title: "Protótipo validado",
      body: "Testado com usuários reais. Todos os estados e fluxos prontos.",
      focusLabel: "Critério",
      focusValue: "usuários completam a tarefa principal sem ajuda",
    },
    {
      color: "teal" as const,
      title: "Especificação técnica",
      body: "Critérios de aceite claros, edge cases priorizados, dependências mapeadas.",
      focusLabel: "Critério",
      focusValue: "engineering consegue estimar sem ambiguidade",
    },
    {
      color: "amber" as const,
      title: "Plano de lançamento",
      body: "Rollout gradual definido, métricas escolhidas, critério de reversão pronto.",
      focusLabel: "Critério",
      focusValue: "CS e Suporte sabem o que muda",
    },
    {
      color: "purple" as const,
      title: "Critério de sucesso",
      body: "Métrica principal e de proteção com linha de base e meta definidas.",
      focusLabel: "Critério",
      focusValue: "time sabe como medir o resultado",
    },
  ],

  step1: {
    stepNumber: 1,
    stepLabel: "Passo 01",
    timeChip: "1 — 2 dias",
    title: "Faça o Handoff Estruturado",
    description:
      "PM e Design apresentam protótipo, spec e critérios de aceite para Engineering. Todas as dúvidas são resolvidas antes do primeiro commit.",
    output: "Handoff concluído — ambiguidades resolvidas, time alinhado",
    template: {
      label: "Checklist de handoff",
      rows: [
        {
          key: "Protótipo",
          value: "Demonstrado para Engineering com todos os estados e fluxos",
        },
        {
          key: "Especificação",
          value: "Critérios de aceite claros para cada cenário e edge case",
        },
        {
          key: "Dependências",
          value: "APIs, integrações e times envolvidos — confirmados com prazo",
        },
        {
          key: "Dúvidas",
          value: "Ambiguidades resolvidas em sessão, decisões registradas",
        },
      ],
    },
    columns: [
      {
        label: "Handoff bem feito",
        items: [
          "Engineering começa sem voltar com dúvidas",
          "Critérios de aceite verificáveis, não subjetivos",
          "Edge cases priorizados — o time sabe o que é P0 e o que é P2",
          "Dependências externas têm responsável e prazo",
        ],
      },
      {
        label: "Sinais de problema",
        items: [
          "Engineering descobre requisitos novos durante o build",
          "Critérios de aceite vagos ou abertos à interpretação",
          "Não houve sessão — apenas um link compartilhado",
          "Perguntas técnicas ficaram sem resposta",
        ],
      },
    ],
  },

  step2: {
    stepNumber: 2,
    stepLabel: "Passo 02",
    timeChip: "1 — 2 dias",
    title: "Quebre em Incrementos e Sequencie",
    description:
      "Quebre a spec em partes que podem ser entregues e testadas separadamente. Comece pelo que é mais crítico.",
    output: "Backlog quebrado, sequenciado e estimado",
    columns: [
      {
        label: "Boa quebra técnica",
        items: [
          "Cada incremento é testável de forma independente",
          "Caminho crítico está no início da sequência",
          "Incrementos desbloqueiam validação parcial pelo trio",
          "Estimativas refletem complexidade real, não pressão de prazo",
        ],
      },
      {
        label: "O que evitar",
        items: [
          "Tarefas grandes demais para revisar em um dia",
          "Sequência que deixa integração para o final",
          "Estimativas sem considerar teste e revisão",
          "Over-engineering em cenários raros",
        ],
      },
    ],
    note: "<strong>Regra prática.</strong> Se não dá para demonstrar em uma sessão curta, está grande demais.",
  },

  bridge1: {
    label: "Transição",
    html: 'Handoff feito, backlog pronto. <strong>O time entra no build com clareza sobre o que entregar e em que ordem.</strong>',
  },

  step3: {
    stepNumber: 3,
    stepLabel: "Passo 03",
    timeChip: "Por sprint",
    title: "Desenvolva com Checkpoints",
    description:
      "PM e Design acompanham o progresso semanalmente. Desvios identificados cedo custam menos para corrigir.",
    output: "Funcionalidade desenvolvida e revisada pelo trio",
    metrics: [
      {
        label: "Checkpoint semanal",
        value: "O que foi entregue esta semana?",
        description: "Progresso vs plano",
      },
      {
        label: "Demo parcial",
        value: "O incremento funciona?",
        description: "Trio valida cada entrega",
      },
      {
        label: "Revisão de critérios",
        value: "Critérios de aceite atendidos?",
        description: "Verificação contra a spec",
      },
    ],
    columns: [
      {
        label: "Checkpoints efetivos",
        items: [
          "Trio se reúne semanalmente para revisar entregas",
          "Demos com dados reais, não mocks",
          "Desvios comunicados no mesmo dia",
          "Ajustes registrados e refletidos no backlog",
        ],
      },
      {
        label: "Sinais de desvio",
        items: [
          "Mais de uma semana sem demo",
          "Critérios de aceite reinterpretados sem alinhamento",
          "Escopo crescendo sem renegociação",
          "PM ou Design só veem o resultado na última semana",
        ],
      },
    ],
    note: "<strong>Renegociação de escopo.</strong> Se o escopo não cabe no prazo, o trio renegocia imediatamente. Surpresa no final não é aceitável.",
  },

  step4: {
    stepNumber: 4,
    stepLabel: "Passo 04",
    timeChip: "2 — 3 dias",
    title: "Garanta Qualidade Antes do Lançamento",
    description:
      "Antes de lançar, teste o fluxo completo: caminho feliz, erros, edge cases. Nenhum bug crítico chega ao usuário.",
    output: "Funcionalidade testada e aprovada para lançamento",
    columns: [
      {
        label: "O que testar",
        items: [
          "Fluxo principal do início ao fim com dados reais",
          "Caminhos alternativos da especificação",
          "Estados de erro, loading, vazio e limite",
          "Regressão em funcionalidades adjacentes",
        ],
      },
      {
        label: "Critérios de aprovação",
        labelColor: "green" as const,
        bgColor: "green" as const,
        items: [
          "Zero bugs críticos no fluxo principal",
          "Critérios de aceite verificados e atendidos",
          "Performance dentro dos limites aceitáveis",
          "Trio aprova o lançamento",
        ],
      },
    ],
    note: "<strong>Bug crítico vs aceitável.</strong> Bug crítico: impede a tarefa principal ou causa perda de dados. O resto pode ser resolvido pós-lançamento.",
  },

  iteration: {
    header:
      "Ciclo de build — repita por sprint até completar o escopo acordado",
    items: [
      { number: "01", name: "Desenvolver", description: "Build do incremento" },
      { number: "02", name: "Revisar", description: "Demo para o trio" },
      { number: "03", name: "Testar", description: "Validar critérios" },
      { number: "04", name: "Ajustar", description: "Corrigir desvios" },
      { number: "05", name: "Aprovar", description: "Pronto para o próximo?" },
    ],
  },

  bridge2: {
    label: "Transição para lançamento",
    html: 'Build completo e qualidade garantida. <strong>O time passa para o lançamento controlado — seguindo o plano definido no upstream.</strong>',
  },

  step5: {
    stepNumber: 5,
    stepLabel: "Passo 05",
    timeChip: "1 — 2 semanas",
    title: "Lance Gradualmente e Monitore",
    description:
      "Comece com um grupo pequeno, monitore as métricas, expanda aos poucos. Se algo sair do esperado, o critério de reversão já existe.",
    output: "Funcionalidade em produção para 100% dos usuários-alvo",
    metrics: [
      {
        label: "Métricas D1",
        value: "Primeiras 24 horas",
        description: "Erros, crashes, comportamento inesperado",
      },
      {
        label: "Métricas D7",
        value: "Primeira semana",
        description: "Adoção, conclusão de tarefa, tickets",
      },
      {
        label: "Métricas D30",
        value: "Primeiro mês",
        description: "Impacto na métrica principal e de proteção",
      },
    ],
    columns: [
      {
        label: "Checklist de lançamento",
        labelColor: "blue" as const,
        bgColor: "blue" as const,
        items: [
          "Feature flag configurada e testada em staging",
          "Grupo inicial definido (percentual ou segmento)",
          "Dashboard de métricas acessível e funcional",
          "CS e Suporte comunicados sobre o que muda",
        ],
      },
      {
        label: "Critérios de expansão",
        items: [
          "Zero bugs críticos no grupo inicial",
          "Métricas D1 dentro do esperado",
          "Sem aumento atípico em tickets de suporte",
          "Trio aprova expansão com base nos dados",
        ],
      },
    ],
    note: "<strong>Comunicação interna.</strong> CS e Suporte precisam saber o que muda antes do primeiro grupo receber a funcionalidade.",
  },

  step6: {
    stepNumber: 6,
    stepLabel: "Passo 06",
    timeChip: "1 — 2 dias",
    title: "Faça a Retrospectiva com Dados",
    description:
      "Compare o resultado real com a meta do upstream. O objetivo é decidir o próximo passo com dados.",
    output: "Retrospectiva documentada — próximo passo definido",
    template: {
      label: "Estrutura da retrospectiva",
      rows: [
        {
          key: "Resultado vs meta",
          value: "Métrica principal vs meta definida no upstream",
        },
        {
          key: "O que funcionou",
          value: "Decisões que contribuíram para o resultado",
        },
        {
          key: "O que não funcionou",
          value: "Onde houve atrito ou retrabalho — e por quê",
        },
        {
          key: "Próximo passo",
          value: "Iterar, expandir, pausar ou encerrar — com base nos dados",
        },
      ],
    },
    columns: [
      {
        label: "Perguntas da retrospectiva",
        items: [
          "A métrica principal se moveu como esperado?",
          "A métrica de proteção se manteve estável?",
          "O que D7 e D30 mostram sobre adoção?",
          "Que decisão acelerou ou atrasou a entrega?",
        ],
      },
      {
        label: "Possíveis próximos passos",
        items: [
          "Iterar: ajustar com base nos aprendizados",
          "Expandir: levar para novos segmentos",
          "Pausar: coletar mais dados antes de agir",
          "Encerrar: hipótese invalidada, seguir em frente",
        ],
      },
    ],
    note: "<strong>Quando está concluída.</strong> Iniciativa concluída = critério atingido ou hipótese invalidada, com aprendizado registrado.",
  },

  deliverables: {
    chip: "Entregáveis finais",
    title: "Artefatos de saída",
    subtitle:
      "Toda iniciativa que completa o downstream produz estes artefatos ao final do ciclo.",
    items: [
      {
        number: "01",
        title: "Funcionalidade em Produção",
        description:
          "Ativa para o público-alvo, com feature flag controlada e monitoramento ativo.",
      },
      {
        number: "02",
        title: "Dashboard de Métricas",
        description:
          "Métrica principal, de proteção e sinal de curto prazo — atualizado e acessível.",
      },
      {
        number: "03",
        title: "Retrospectiva Documentada",
        description:
          "Resultado vs expectativa, aprendizados e decisão sobre próximo passo.",
      },
    ],
  },

  footer: {
    quote: "Ciclo fechado = resultado medido + aprendizado registrado.",
    brand: "ZapSign · Time de Produto",
  },
};
