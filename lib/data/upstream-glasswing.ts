export const upstreamGlasswingData = {
  topbar: {
    brand: "ZapSign | Product Hubble",
  },

  hero: {
    eyebrow: "Guideline",
    title: "Upstream",
    subtitle: "Antes de escrever código, entenda o que vale a pena construir.",
    continueLabel: "Continuar lendo",
  },

  introduction: {
    label: "Introdução",
    paragraphs: [
      "O Upstream é a parte do ciclo em que a pergunta ainda está em aberto. Não se escreve código, não se define prazo, não se compromete escopo — se entende o problema, se escolhe uma direção e se monta o contrato que vai guiar a entrega. É onde o investimento de tempo é menor e o valor das decisões é maior.",
      "Na ZapSign, tratamos o Upstream como uma disciplina, não como uma fase de preparação. Cada iniciativa que entra em desenvolvimento precisa ter passado por um processo explícito de formulação: problema escrito, critério de sucesso acordado, escopo delimitado, solução validada. Sem esses quatro, o Downstream começa no escuro.",
      "Este guia descreve como o trio — Product, Design e Engineering — opera o Upstream. O objetivo não é ritualizar; é reduzir o custo de errar cedo e aumentar a chance de acertar o problema certo antes de investir na solução.",
    ],
  },

  context: {
    label: "A economia da descoberta",
    paragraphs: [
      "Errar no problema custa mais caro do que errar na solução. Quando o time resolve o problema errado com excelência, entrega uma funcionalidade polida que ninguém usa. Quando resolve o problema certo com uma solução mediana, ainda move a métrica. É por isso que o Upstream vale mais do que parece à primeira vista: ele não produz código, mas define o que vai ser construído — e o que não vai.",
      "Durante muito tempo, a descoberta era vista como sobrecusto. A pressão por velocidade empurrava times a pular direto para a solução, apostando que iteração pós-lançamento resolveria o que a formulação deveria ter resolvido antes. O resultado conhecido: features lançadas pela metade, backlog inchado de ideias não priorizadas, dívida de produto se acumulando em silêncio.",
      "A resposta não é desacelerar. É investir o tempo certo no lugar certo. Duas semanas escrevendo um ponto de partida evitam seis semanas construindo algo que ninguém pediu. Três dias explorando direções de design economizam três sprints de retrabalho. Upstream é o lugar mais barato para errar — e, por isso mesmo, o lugar onde mais se deveria errar.",
      "A disciplina não está em produzir mais documentos. Está em garantir que cada iniciativa que chega ao Downstream passou pelos mesmos quatro pontos de controle: problema, métrica, escopo, validação. Esses são os fundamentos que o guia cobre.",
    ],
  },

  phases: {
    label: "Os seis passos",
    intro:
      "O Upstream se organiza em seis passos encadeados. Os três primeiros definem o problema; os três últimos escolhem, validam e preparam a solução. Nenhum começa antes que o anterior tenha fechado seu portão de saída.",
    items: [
      {
        number: "01",
        name: "Escreva o ponto de partida",
        duration: "1 — 2 dias",
        body: "O ponto de partida é o que faz o time concordar com o problema antes de discordar da solução. Ele registra contexto, alvo, hipótese e — tão importante quanto — o que está fora de escopo. Sem essa clareza, qualquer solução parece certa porque não existe critério para dizer o contrário.",
        highlights: [
          "Qualquer pessoa do time explica em 30 segundos.",
          "Existe pelo menos uma evidência que justifica fazer agora.",
          "O que está fora do escopo está escrito.",
        ],
        ownership: {
          owner: {
            role: "Product Manager",
            focus: "Formulação do problema, alvo e hipótese.",
          },
          contributors: [
            { role: "Product Designer", focus: "Sinais de fricção observados em pesquisa e interface." },
            { role: "Tech Lead", focus: "Restrições técnicas que mudam o enquadramento do problema." },
          ],
        },
      },
      {
        number: "02",
        name: "Defina o critério de sucesso",
        duration: "2 — 4 dias",
        body: "Antes de prototipar, o time precisa saber como vai medir que acertou. Métrica principal, métrica de proteção e sinal de curto prazo — três números que transformam intuição em hipótese testável. Em apostas sem métrica estabelecida, o trio define um comportamento proxy que serve de bússola.",
        highlights: [
          "Métrica principal, proteção e sinal de curto prazo definidos.",
          "Linha de base e prazo combinados antes do build.",
          "O time consegue acompanhar a métrica sem depender de terceiros.",
        ],
        ownership: {
          owner: {
            role: "Product Manager",
            focus: "Escolha das métricas e acordo sobre linha de base.",
          },
          contributors: [
            { role: "Data", focus: "Instrumentação disponível, linha de base e viabilidade de medição." },
            { role: "Tech Lead", focus: "Eventos e tracking necessários antes do build." },
          ],
        },
      },
      {
        number: "03",
        name: "Delimite o escopo com intenção",
        duration: "1 — 2 dias",
        body: "Escopo é uma decisão, não uma lista de features. O time escolhe o tamanho certo — Task, One-Pager ou DCP — e escreve o que entra, o que fica fora e por quê. O teste rápido: se você não consegue explicar em uma frase o que o escopo não cobre, ele ainda não está pronto.",
        highlights: [
          "Artefato no tamanho certo da iniciativa (Task / One-Pager / DCP).",
          "Fora de escopo explícito e justificado.",
          "Escopo move o critério de sucesso definido no passo anterior.",
        ],
        ownership: {
          owner: {
            role: "Product Manager",
            focus: "Decisão do que entra, do que fica fora e do tamanho do artefato.",
          },
          contributors: [
            { role: "Tech Lead", focus: "Limites técnicos e ordem de execução viável." },
            { role: "Product Designer", focus: "Cenários e estados que precisam caber no escopo." },
          ],
        },
      },
      {
        number: "04",
        name: "Explore direções e escolha uma",
        duration: "2 — 5 dias",
        body: "O erro mais caro é ir direto para a primeira ideia. O trio explora ao menos três direções antes de escolher — com rascunhos rápidos, não protótipos caros. Exploração é barata; retrabalho em código é caro. PM é co-responsável pelo protótipo em baixa fidelidade.",
        highlights: [
          "Ao menos três direções exploradas antes da escolha.",
          "PM e Design trabalham juntos, não em sequência.",
          "Decisão documentada com o racional da escolha.",
        ],
        ownership: {
          owner: {
            role: "Product Designer",
            focus: "Exploração das direções e condução do protótipo.",
          },
          contributors: [
            { role: "Product Manager", focus: "Regras de negócio e coerência com o critério de sucesso." },
            { role: "Tech Lead", focus: "Viabilidade das direções e custo relativo de cada alternativa." },
          ],
        },
      },
      {
        number: "05",
        name: "Valide com usuários reais",
        duration: "Iterativo",
        body: "Validação interna reduz ruído; validação com usuário reduz risco. Cinco testes revelam a maior parte dos problemas de uma interface. O ciclo — prototipar, testar, aprender, refinar — se repete até o time ter confiança suficiente para comprometer o build, não até o protótipo estar perfeito.",
        highlights: [
          "Teste com cinco usuários do segmento-alvo.",
          "Registro estruturado de erros, hesitações e expectativas.",
          "Sinal de sucesso: usuário completa a tarefa sem ajuda.",
        ],
        ownership: {
          owner: {
            role: "Product Designer",
            focus: "Roteiro de testes, condução e síntese dos aprendizados.",
          },
          contributors: [
            { role: "Product Manager", focus: "Leitura dos achados à luz do critério de sucesso." },
            { role: "Customer Success", focus: "Recrutamento de participantes do segmento-alvo." },
          ],
        },
      },
      {
        number: "06",
        name: "Especifique e planeje o lançamento",
        duration: "2 — 4 dias",
        body: "Especificação é o contrato de execução: protótipo em alta fidelidade, critérios de aceite verificáveis, casos de borda mapeados, plano de rollout gradual com critério de reversão. Lançamento não é o fim do Upstream — é a ponte medida até o Downstream, onde o aprendizado vira dado.",
        highlights: [
          "Especificação fecha a porta para dúvidas no Downstream.",
          "Plano de lançamento com grupo inicial e critério de reversão.",
          "CS e Suporte sabem o que muda antes do primeiro usuário receber.",
        ],
        ownership: {
          owner: {
            role: "Product Manager + Tech Lead",
            focus: "Co-ownership do contrato de execução e do plano de rollout.",
          },
          contributors: [
            { role: "Product Designer", focus: "Estados finais, acabamento e assets de onboarding." },
            { role: "Product Marketing", focus: "Narrativa, timing e comunicação externa." },
            { role: "Customer Success / Suporte", focus: "Preparação de base e treinamento pré-lançamento." },
          ],
        },
      },
    ],
  },

  benchmarks: {
    label: "O que o tempo no upstream compra",
    intro:
      "Ao longo dos últimos ciclos, observamos diferenças sistemáticas entre iniciativas que passaram por um Upstream disciplinado e as que pularam etapas. Os valores abaixo são ilustrativos da magnitude; a direção, em todos os casos, se repete.",
    blocks: [
      {
        title: "Aderência ao critério de sucesso após lançamento",
        description:
          "Proporção de iniciativas que atingiram ou superaram a meta combinada no Upstream.",
        series: [
          { label: "Com ponto de partida e métrica escritos", value: 78, highlight: true },
          { label: "Sem ponto de partida formal", value: 34 },
        ],
        unit: "%",
      },
      {
        title: "Retrabalho em desenvolvimento após validação",
        description:
          "Horas de desenvolvimento gastas em mudanças de escopo após o primeiro commit.",
        series: [
          { label: "Com validação com usuário no Upstream", value: 22, highlight: true },
          { label: "Validação só interna", value: 68 },
        ],
        unit: "índice relativo",
      },
    ],
    timeline: {
      title: "Custo de uma decisão ruim por fase do ciclo",
      description:
        "Quanto mais cedo uma decisão é revista, menor o custo de mudá-la. A curva mostra o custo relativo de corrigir o mesmo erro em cada fase.",
      unit: "×",
      points: [
        { label: "Ponto de partida", value: 1, caption: "mais barato" },
        { label: "Critério", value: 3, caption: "reescrever hipótese" },
        { label: "Escopo", value: 8, caption: "replanejar entrega" },
        { label: "Protótipo", value: 20, caption: "refazer direção" },
        { label: "Em produção", value: 60, caption: "reverter e recomeçar" },
      ],
    },
  },

  intermission: {
    kind: "ladder" as const,
    eyebrow: "Metáfora",
    title: "Escada de fidelidade",
    body: "Cada degrau custa mais do que o anterior. Subir antes da hora é retrabalho; parar antes da hora é risco. O Upstream é a disciplina de saber em que degrau estamos — e quando dá para subir.",
  },

  stakeholders: {
    eyebrow: "Quem participa",
    title: "O trio, com reforços no momento certo",
    description:
      "O Upstream é liderado pelo trio — PM, Design e Tech Lead — mas outras áreas entram em momentos específicos. O objetivo é ter a voz certa na conversa certa, sem sobrecarregar o processo.",
    items: [
      {
        code: "01",
        role: "Product Manager",
        focus: "Formulação do problema, critério de sucesso e escopo.",
      },
      {
        code: "02",
        role: "Product Designer",
        focus: "Exploração de direções, protótipo e validação com usuário.",
      },
      {
        code: "03",
        role: "Tech Lead",
        focus: "Viabilidade, arquitetura e limites técnicos desde cedo.",
      },
      {
        code: "04",
        role: "Data",
        focus: "Linha de base, instrumentação e leitura de sinais.",
      },
      {
        code: "05",
        role: "Customer Success",
        focus: "Voz do cliente atual e fricções conhecidas em contas-chave.",
      },
      {
        code: "06",
        role: "Suporte",
        focus: "Padrões de ticket e sinais silenciosos de problema.",
      },
      {
        code: "07",
        role: "Product Marketing",
        focus: "Narrativa, timing e hipótese de posicionamento.",
      },
      {
        code: "08",
        role: "Segurança / Jurídico",
        focus: "Restrições regulatórias consultadas cedo, não no final.",
      },
    ],
  },

  voices: {
    label: "Vozes do time",
    intro:
      "Como cada papel do trio vive o Upstream. Vozes compostas a partir da prática de diferentes iniciativas.",
    quotes: [
      {
        body: "O ponto de partida é o lugar onde o time para de argumentar em cima de solução. Quando ele está escrito, as conversas ficam mais curtas: em vez de discutir feature, a gente discute se a hipótese explica o que vemos nos dados. Essa mudança é sutil, mas muda tudo.",
        role: "Product Manager",
        context: "Passo 01 · Ponto de partida",
      },
      {
        body: "Três direções em papel custam meia manhã. Três direções em Figma custam três dias. O trio que entende essa economia chega na reunião com rascunhos, não com wireframes. A primeira ideia é quase nunca a melhor — mas fica parecendo a melhor quando não existe outra.",
        role: "Product Designer",
        context: "Passo 04 · Direções",
      },
      {
        body: "Entrar no Upstream cedo evita a conversa cara: quando a arquitetura já não cabe na direção escolhida. Não é sobre bloquear a ideia; é sobre trocar o 'não dá' abstrato por uma proposta viável que o PM e o Design podem reagir em minutos.",
        role: "Tech Lead",
        context: "Passo 03 · Escopo",
      },
      {
        body: "Cinco usuários derrubam a maioria dos castelos de areia. É difícil defender a direção escolhida depois de ver o segundo participante travar no mesmo ponto. Validar não é buscar confirmação; é criar uma chance honesta da sua hipótese estar errada.",
        role: "Product Designer",
        context: "Passo 05 · Validação",
      },
    ],
  },

  plans: {
    label: "Artefatos de saída",
    intro:
      "Toda iniciativa que completa o Upstream produz três artefatos. Eles são o contrato do trio com o resto da companhia — e o ponto de partida do Downstream.",
    items: [
      {
        number: "01",
        title: "Protótipo em alta fidelidade",
        body: "Todos os estados, erros e fluxos no Figma. Dono por Product Design, com PM garantindo que regras de negócio estão refletidas e Tech Lead assinando viabilidade técnica antes do congelamento.",
      },
      {
        number: "02",
        title: "Especificação técnica",
        body: "Contrato de execução combinando negócio, design e engenharia em um único artefato. Co-ownership de PM e Tech Lead; critérios de aceite verificáveis e casos de borda documentados.",
      },
      {
        number: "03",
        title: "Plano de lançamento",
        body: "Como vai ao ar, para quem, como se mede, como se reverte. Dono por PM (ou PMM quando existir), com Tech Lead cuidando de rollout, feature flags e observabilidade.",
      },
    ],
  },

  appendix: {
    label: "Appendix",
    footnotes: [
      {
        number: "1",
        html: 'O termo <em>upstream</em> vem da metáfora do rio: tudo que acontece a montante de onde a entrega chega ao usuário. No nosso processo, Upstream é onde a hipótese é formulada e validada; Downstream é onde ela flui até a produção.',
      },
      {
        number: "2",
        html: '<strong>Task, One-Pager, DCP</strong>: três tamanhos de artefato para escopo. Task para entregas de até um sprint; One-Pager para iniciativas de 1 a 3 sprints; DCP para trimestres ou mais, com árvore de oportunidades e pesquisa dedicada.',
      },
      {
        number: "3",
        html: 'Uma iniciativa só sai do Upstream com os três artefatos prontos: protótipo, especificação e plano de lançamento. Sem esses, o Downstream começa com débito — e o débito vira retrabalho no sprint.',
      },
    ],
  },

  footer: {
    quote: "Errar cedo custa pouco. No papel, quase nada.",
    brand: "ZapSign · Time de Produto",
    meta: "Guia interno · Abril 2026",
  },
};
