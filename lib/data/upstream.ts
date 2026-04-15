export const upstreamData = {
  header: {
    pill: "Guia de Processo · Produto",
    title: "Upstream",
    description:
      "Antes de escrever código, entenda o que vale a pena construir — e por quê.",
    meta: {
      label: "ZapSign · Time de Produto",
      detail: "Versão 1.1 · Abril 2026",
    },
  },

  principles: [
    {
      number: "01",
      title: "Resultado antes de feature",
      body: "Antes de pensar em funcionalidade, defina o comportamento que você quer mudar no usuário.",
    },
    {
      number: "02",
      title: "Evidência bate opinião",
      body: "Mas entrega bate pesquisa infinita. Saiba quando você já tem o suficiente para agir.",
    },
    {
      number: "03",
      title: "Critério de sucesso antes do build",
      body: "Se não tem como saber se funcionou, não tem como justificar o esforço.",
    },
    {
      number: "04",
      title: "Alinhe no problema, não na solução",
      body: "Quem precisa aprovar deve entender o problema junto com você — não ver o protótipo pronto.",
    },
  ],

  startingPoints: [
    {
      color: "blue" as const,
      title: "Problema do usuário",
      body: "Fricção, falha ou limitação clara vinda de dados, suporte ou pesquisa.",
      focusLabel: "Foco do discovery",
      focusValue: "tamanho e frequência do problema",
    },
    {
      color: "amber" as const,
      title: "Aposta estratégica",
      body: "Algo que queremos construir antes de qualquer concorrente — sem demanda explícita ainda.",
      focusLabel: "Foco do discovery",
      focusValue: "hipótese de valor e viabilidade técnica",
    },
    {
      color: "teal" as const,
      title: "Oportunidade de negócio",
      body: "Parceria, novo segmento ou linha de receita que pede uma capacidade nova.",
      focusLabel: "Foco do discovery",
      focusValue: "se o valor de negócio se sustenta para o usuário",
    },
    {
      color: "purple" as const,
      title: "Obrigação",
      body: "Regulação, compliance ou requisito contratual. O escopo vem parcialmente de fora.",
      focusLabel: "Foco do discovery",
      focusValue: "como entregar com menor fricção possível",
    },
  ],

  step1: {
    stepNumber: 1,
    stepLabel: "Passo 01",
    timeChip: "1 — 2 dias",
    title: "Escreva o Ponto de Partida",
    description:
      "Não importa se veio de um cliente, de uma aposta ou de compliance — o ponto de partida precisa estar escrito antes de qualquer solução. Se o time não concorda sobre o problema, qualquer solução vai parecer certa.",
    output: "Ponto de partida escrito e alinhado com o time",
    template: {
      label: "Estrutura mínima — serve para qualquer ponto de partida",
      rows: [
        {
          key: "Contexto",
          value: "O que está acontecendo que torna isso relevante agora?",
        },
        {
          key: "Alvo",
          value: "Qual usuário ou segmento queremos impactar?",
        },
        {
          key: "Hipótese",
          value:
            "Se fizermos X, o usuário vai Y, gerando Z para o negócio.",
        },
        {
          key: "Fora de escopo",
          value: "O que esta iniciativa deliberadamente não resolve?",
        },
      ],
    },
    columns: [
      {
        label: "Sinais de que está bom",
        items: [
          "Qualquer pessoa do time explica em 30 segundos",
          "O time concorda com o problema, não com a solução",
          "Tem pelo menos uma evidência que justifica fazer agora",
          "O que está fora do escopo está explícito",
        ],
      },
      {
        label: "Armadilha frequente",
        items: [
          "Escrever solução disfarçada de problema",
          '"Precisamos de um app" é solução — não ponto de partida',
          '"Nenhum concorrente tem X" é aposta — precisa de hipótese',
          "Abrir documento de escopo sem o problema acordado",
        ],
      },
    ],
  },

  step2: {
    stepNumber: 2,
    stepLabel: "Passo 02",
    timeChip: "2 — 4 dias",
    title: "Defina o Critério de Sucesso",
    description:
      "Antes de prototipar qualquer coisa, defina como você vai saber que acertou. Em apostas e inovações, parte das métricas pode precisar ser criada — o importante é ter uma hipótese mensurável, não uma métrica perfeita.",
    output: "Critério de sucesso com linha de base e prazo acordados",
    metrics: [
      {
        label: "Métrica principal",
        value: "O que queremos mover?",
        description: "Ex: taxa de conclusão de assinatura",
      },
      {
        label: "Métrica de proteção",
        value: "O que não pode piorar?",
        description: "Ex: tempo médio para assinar",
      },
      {
        label: "Sinal de curto prazo",
        value: "O que indica progresso?",
        description: "Ex: queda em tickets de reenvio",
      },
    ],
    columns: [
      {
        label: "Boas perguntas para se fazer",
        items: [
          "Que comportamento do usuário queremos mudar?",
          "Como medimos isso hoje? Qual é a linha de base?",
          "Que melhoria justifica o investimento?",
          "Em quanto tempo esperamos ver resultado?",
        ],
      },
      {
        label: "O que evitar",
        items: [
          "Métricas de atividade sem contexto de resultado",
          "Mais de 3 métricas principais por iniciativa",
          "Definir métricas depois que o dev começou",
          "Métricas que o time não consegue acompanhar sozinho",
        ],
      },
    ],
    note: "<strong>Para apostas e inovação:</strong> quando não existe métrica estabelecida, defina um comportamento proxy — o que o usuário faria diferente se a aposta funcionasse? O importante é ter uma hipótese testável, não um dashboard perfeito.",
  },

  step3: {
    stepNumber: 3,
    stepLabel: "Passo 03",
    timeChip: "1 — 2 dias",
    title: "Delimite o Escopo com Intenção",
    description:
      'Escopo não é lista de features. É uma decisão sobre o que você vai resolver agora e o que vai deixar para depois. O "não faremos" precisa estar escrito com a mesma clareza do "faremos".',
    output: "Escopo acordado — o que entra, o que fica fora e por quê",
    scale: [
      {
        size: "sm" as const,
        label: "Pequeno",
        artifact: "Task",
        description:
          "Task com hipótese e critério de aceite — menos de 1 sprint",
      },
      {
        size: "md" as const,
        label: "Médio",
        artifact: "One-Pager",
        description:
          "One-Pager com contexto, hipótese e cenários — 1 a 3 sprints",
      },
      {
        size: "lg" as const,
        label: "Grande",
        artifact: "DCP",
        description:
          "DCP com pesquisa, árvore de oportunidades e viabilidade — acima de 1 trimestre",
      },
    ],
    columns: [
      {
        label: "Entra no escopo",
        items: [
          "O mínimo que move o critério de sucesso",
          "Cenários que cobrem 80%+ dos casos reais",
          "O que é viável dentro da janela de tempo",
        ],
      },
      {
        label: "Fica fora do escopo",
        items: [
          "Casos extremos com menos de 5% do volume",
          "Melhorias que não movem o critério de sucesso",
          "Dependências que atrasam o núcleo da entrega",
        ],
      },
    ],
    note: "<strong>Teste rápido:</strong> se você não consegue explicar em uma frase o que o escopo não inclui, ele ainda não está pronto.",
  },

  bridge1: {
    label: "Transição",
    html: "Problema claro, critério de sucesso definido, escopo acordado. <strong>Agora o time tem contexto para explorar soluções.</strong> A fase de design começa com hipóteses — não com certezas.",
  },

  step4: {
    stepNumber: 4,
    stepLabel: "Passo 04",
    timeChip: "2 — 5 dias",
    title: "Explore Direções e Escolha Uma",
    description:
      "O erro mais caro é ir direto para a primeira ideia. Dedique tempo a explorar alternativas antes de escolher. Exploração é barata — retrabalho em código é caro.",
    output: "Direção escolhida com racional — protótipo em baixa fidelidade",
    fidelity: [
      { label: "Divergência", description: "Múltiplas direções" },
      { label: "Fluxo em papel", description: "Rascunho do caminho" },
      { label: "Wireframe", description: "Estrutura de tela" },
      { label: "Protótipo", description: "Alta fidelidade" },
    ],
    columns: [
      {
        label: "Como explorar bem",
        items: [
          "Explore ao menos 3 direções antes de escolher",
          "PM e design trabalham juntos — não em sequência",
          "Use o design system como ponto de partida criativo",
          "Referências servem para aprender, não para copiar",
        ],
      },
      {
        label: "Critério de escolha",
        items: [
          "Qual direção tem maior chance de mover a métrica?",
          "Qual é viável dentro do escopo?",
          "Qual é mais simples de testar primeiro?",
          "O time consegue explicar por que escolheu essa?",
        ],
      },
    ],
    note: "<strong>PM é co-responsável pelo protótipo.</strong> Com Claude e Figma você gera uma primeira versão em horas. O objetivo é ter algo para reagir — não algo perfeito.",
  },

  step5: {
    stepNumber: 5,
    stepLabel: "Passo 05",
    timeChip: "Iterativo",
    title: "Valide com Usuários Reais",
    description:
      "Validação interna reduz ruído. Validação com usuário reduz risco. As duas são necessárias, mas a segunda é insubstituível. Cinco testes revelam 85% dos problemas de uma interface.",
    output: "Protótipo validado — aprendizados documentados",
    columns: [
      {
        label: "Validação interna — alinhamento",
        labelColor: "blue" as const,
        bgColor: "blue" as const,
        items: [
          "Revisão com PM, design e tech lead",
          "Apresentação para CS, CX e Vendas",
          "Votação no sextou com dados reais",
          "Verificação contra o critério de sucesso",
        ],
      },
      {
        label: "Validação com usuário — aprendizado",
        labelColor: "green" as const,
        bgColor: "green" as const,
        items: [
          "Teste com 5 usuários do segmento-alvo",
          "Tarefas específicas — observe, não guie",
          "Perguntas abertas sobre confusões e expectativas",
          "Registro estruturado de erros e hesitações",
        ],
      },
    ],
    note: "<strong>Sinal de que a validação foi bem:</strong> usuários completam a tarefa principal sem ajuda, não perguntam o que fazer a seguir, e o feedback aponta acabamento — não problemas de fluxo.",
  },

  iteration: {
    header:
      "Ciclo de iteração — repita até ter confiança suficiente para ir para entrega",
    items: [
      { number: "01", name: "Prototipar", description: "Explore a solução" },
      { number: "02", name: "Testar", description: "Com usuários reais" },
      { number: "03", name: "Aprender", description: "Documente os achados" },
      { number: "04", name: "Refinar", description: "Ajuste a direção" },
      { number: "05", name: "Decidir", description: "Confiança suficiente?" },
    ],
  },

  bridge2: {
    label: "Transição para entrega",
    html: 'A solução tem evidência para ser desenvolvida. <strong>A pergunta muda de "o que faz sentido?" para "como entregamos isso?"</strong>',
  },

  step6: {
    stepNumber: 6,
    stepLabel: "Passo 06",
    timeChip: "2 — 4 dias",
    title: "Especifique, Negocie e Planeje o Lançamento",
    description:
      "Lançamento não é o fim — é o início da medição. Defina como vai lançar, para quem, e como vai medir o impacto desde o primeiro deploy. Lançamento gradual e critério de reversão são parte do processo, não improviso de última hora.",
    output: "Especificação completa + plano de lançamento aprovado",
    columns: [
      {
        label: "O que a especificação precisa ter",
        items: [
          "Protótipo em alta fidelidade com todos os estados e erros",
          "Critérios de aceite claros e verificáveis",
          "Casos de borda priorizados e documentados",
          "Dependências técnicas e riscos mapeados",
        ],
      },
      {
        label: "Plano de lançamento",
        labelColor: "blue" as const,
        bgColor: "blue" as const,
        items: [
          "Ativação gradual com controle por grupo",
          "Métricas acompanhadas no 1o, 7o e 30o dia",
          "Critério de reversão definido antes do deploy",
          "Comunicação para CS e Suporte antes de ir ao ar",
        ],
      },
    ],
    note: "<strong>Via de mão dupla:</strong> se o prazo compromete a qualidade, o time levanta a bandeira antes — não depois. Negociar escopo é sempre melhor do que lançar algo que não move a métrica.",
  },

  deliverables: {
    chip: "Entregáveis finais",
    title: "Artefatos de saída",
    subtitle:
      "Toda iniciativa que completa o upstream produz estes artefatos antes de ir para desenvolvimento.",
    items: [
      {
        number: "01",
        title: "Protótipo em Alta Fidelidade",
        description:
          "Todos os estados, erros e fluxos no Figma. O que o produto vai parecer e como vai se comportar.",
      },
      {
        number: "02",
        title: "Especificação Técnica",
        description:
          "Regras de negócio, critérios de aceite, casos de borda priorizados e decisões de design documentadas.",
      },
      {
        number: "03",
        title: "Plano de Lançamento",
        description:
          "Ativação gradual, métricas de acompanhamento, critério de reversão e comunicação interna.",
      },
    ],
  },

  nextSteps: {
    chip: "O que fazer agora",
    title: "Próximos passos",
    subtitle:
      "Upstream é o começo. Aqui está o caminho para colocar isso em prática.",
    items: [
      {
        number: "01",
        title: "Pegue sua próxima iniciativa",
        description:
          "Escolha a iniciativa mais relevante do trimestre e comece pelo Passo 01.",
      },
      {
        number: "02",
        title: "Alinhe com seu trio",
        description:
          "Compartilhe o ponto de partida com design e tech lead antes de explorar soluções.",
      },
      {
        number: "03",
        title: "Use os templates",
        description:
          "Comece pelo template do tamanho certo — Task, One-Pager ou DCP — em vez de documento em branco.",
      },
      {
        number: "04",
        title: "Traga o resultado na review",
        description:
          "Mostre o critério de sucesso e o que aprendeu, não só o que construiu.",
      },
      {
        number: "05",
        title: "Leve para o downstream",
        description:
          "Com os artefatos prontos, o próximo capítulo é o downstream — onde a execução, QA e lançamento acontecem.",
        isLink: true,
        href: "/dashboard/downstream",
      },
    ],
  },

  footer: {
    quote:
      "Processo bom é o que desaparece no dia a dia. O resultado é o que fica.",
    brand: "ZapSign · Time de Produto",
  },
};
