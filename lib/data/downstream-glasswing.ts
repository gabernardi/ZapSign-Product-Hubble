export const downstreamGlasswingData = {
  topbar: {
    brand: "ZapSign | Product Hubble",
  },

  hero: {
    eyebrow: "Guideline",
    title: "Downstream",
    subtitle: "Do protótipo validado à entrega medida.",
    continueLabel: "Continuar lendo",
  },

  introduction: {
    label: "Introdução",
    paragraphs: [
      "O Downstream começa onde o Upstream termina. Ao longo dessa travessia, um protótipo validado se transforma em funcionalidade em produção, instrumentada e acompanhada por dados reais. É um trajeto curto em dias de calendário e longo em consequências: cada entrega que sai da porta carrega a promessa de melhorar um resultado — e a obrigação de provar que o fez.",
      "Na ZapSign, entendemos entrega como validação. Se a métrica principal não se move dentro do prazo combinado com o Upstream, a iniciativa não acabou. O ciclo só fecha quando o aprendizado é registrado e a decisão sobre o próximo passo é tomada com base em números, não em intenções.",
      "Este guia descreve como o trio — Product, Design e Engineering — opera essa travessia. Ele é prescritivo quando precisa ser e aberto onde o contexto exige julgamento. As práticas aqui descritas são o mínimo comum esperado de toda iniciativa que passa pelo Downstream da ZapSign.",
    ],
  },

  context: {
    label: "Entrega na era da validação",
    paragraphs: [
      "Por muito tempo, equipes de produto foram medidas pelo que conseguiam entregar. Lançar era o objetivo; o que acontecia depois era uma outra conversa, quase sempre informal, quase sempre sem dono. Esse arranjo funcionou enquanto o custo de manter funcionalidades era baixo e enquanto faltava instrumentação para saber se elas realmente pegavam.",
      "Hoje, o cenário é outro. Cada nova funcionalidade competindo pela atenção do usuário acumula complexidade no produto, amplia a superfície de suporte e cria dívida silenciosa. Entregar sem medir deixou de ser economia e passou a ser desperdício. O time que lança mais rápido pode estar, na verdade, acumulando iniciativas pela metade.",
      "A resposta não é lançar menos. É lançar com a disciplina de um laboratório: começar por poucos usuários, expandir com critério, reverter sem cerimônia quando os dados contradizem a hipótese. Gradual antes de total. Medir antes de decidir. A qualidade é responsabilidade do trio, não um estágio no fim do pipeline.",
      "Downstream é o nome que damos a essa disciplina. Ele existe para garantir que cada ciclo termine com um resultado medido e um aprendizado registrado — os únicos dois ativos duráveis que o time produz.",
    ],
  },

  phases: {
    label: "As quatro fases",
    intro:
      "A travessia se organiza em quatro fases com responsabilidades distintas. Cada fase entrega um artefato concreto para a próxima; nenhuma começa antes que a anterior tenha fechado seu portão de saída.",
    items: [
      {
        number: "01",
        name: "Handoff e planejamento técnico",
        duration: "1 — 2 dias",
        body: "PM e Design apresentam protótipo, especificação e critérios de aceite para Engineering em sessão viva. As dúvidas são resolvidas antes do primeiro commit. O que sai dessa fase é um backlog quebrado e sequenciado, com caminho crítico no início e estimativas que refletem complexidade real — não pressão de prazo.",
        highlights: [
          "Engineering começa sem voltar com dúvidas.",
          "Critérios de aceite são verificáveis, não subjetivos.",
          "Dependências externas têm responsável e prazo.",
        ],
        ownership: {
          owner: {
            role: "Tech Lead",
            focus: "Quebra técnica, sequenciamento do backlog e estimativas.",
          },
          contributors: [
            { role: "Product Manager", focus: "Regras de negócio e critérios de aceite apresentados na sessão." },
            { role: "Product Designer", focus: "Protótipo entregue com estados finais e fluxos cobertos." },
          ],
        },
      },
      {
        number: "02",
        name: "Build e qualidade",
        duration: "Por sprint",
        body: "O trio se reúne semanalmente para revisar entregas parciais com dados reais, não mocks. Desvios são comunicados no mesmo dia em que aparecem. Se o escopo não cabe no prazo, ele é renegociado imediatamente — surpresa no final não é aceitável. Antes do lançamento, o fluxo completo é testado: caminho feliz, erros, edge cases. Nenhum bug crítico chega ao usuário.",
        highlights: [
          "Demos semanais com incremento funcional.",
          "Renegociação de escopo é rotina, não exceção.",
          "Zero bugs críticos no fluxo principal antes de lançar.",
        ],
        ownership: {
          owner: {
            role: "Tech Lead",
            focus: "Qualidade do código, ritmo de sprint e sinalização precoce de desvios.",
          },
          contributors: [
            { role: "Product Manager", focus: "Priorização em renegociações de escopo no meio do caminho." },
            { role: "Product Designer", focus: "Revisão de estados, polimento de UX e edge cases." },
            { role: "QA / Engenharia", focus: "Cobertura do fluxo principal antes do lançamento." },
          ],
        },
      },
      {
        number: "03",
        name: "Lançamento controlado",
        duration: "1 — 2 semanas",
        body: "O rollout começa com um grupo pequeno — percentual ou segmento — com feature flag testada em staging e dashboard de métricas já acessível. CS e Suporte sabem o que muda antes do primeiro usuário receber. A expansão só acontece quando os números D1 confirmam a hipótese e não há aumento atípico de tickets. Se algo sair do esperado, o critério de reversão já existe.",
        highlights: [
          "Feature flag ativa com grupo inicial definido.",
          "Métricas D1 acompanhadas em tempo real.",
          "Critério de reversão documentado antes do lançamento.",
        ],
        ownership: {
          owner: {
            role: "Product Manager",
            focus: "Decisão de expansão, critério de reversão e acompanhamento em tempo real.",
          },
          contributors: [
            { role: "Tech Lead", focus: "Feature flag, observabilidade e execução do rollout." },
            { role: "Customer Success", focus: "Comunicação com contas-chave antes e durante o lançamento." },
            { role: "Suporte", focus: "Treinamento, artigos de ajuda e triagem pós-lançamento." },
            { role: "Product Marketing", focus: "Narrativa e timing da comunicação externa." },
          ],
        },
      },
      {
        number: "04",
        name: "Aprendizado com dados",
        duration: "1 — 2 dias",
        body: "Fechado o rollout, o trio compara o resultado com a meta acordada no Upstream. A retrospectiva responde quatro perguntas: a métrica principal se moveu como esperado? A de proteção se manteve estável? O que D7 e D30 dizem sobre adoção? Que decisão acelerou ou atrasou a entrega? O próximo passo — iterar, expandir, pausar ou encerrar — é definido com base nos dados, e o aprendizado é registrado para que o próximo ciclo não comece do zero.",
        highlights: [
          "Resultado comparado à meta do Upstream.",
          "Aprendizado documentado e acessível.",
          "Decisão sobre próximo passo tomada com dados.",
        ],
        ownership: {
          owner: {
            role: "Product Manager",
            focus: "Retrospectiva, decisão sobre próximo passo e registro do aprendizado.",
          },
          contributors: [
            { role: "Tech Lead", focus: "Leitura técnica do que acelerou ou atrasou a entrega." },
            { role: "Product Designer", focus: "Aprendizados de UX e polimentos identificados no ciclo." },
            { role: "Data", focus: "Leitura dos números D1, D7, D30 e consistência da medição." },
          ],
        },
      },
    ],
  },

  benchmarks: {
    label: "O que os dados mostram",
    intro:
      "Ao longo dos últimos ciclos, observamos diferenças sistemáticas entre iniciativas que fecharam o Downstream com disciplina e as que pularam etapas. Os valores abaixo são ilustrativos da magnitude do efeito; a direção, em todos os casos, se repete.",
    blocks: [
      {
        title: "Ciclo fechado com retrospectiva",
        description:
          "Proporção de iniciativas que produziram aprendizado documentado e decisão explícita sobre próximo passo.",
        series: [
          { label: "Com retrospectiva formal", value: 92, highlight: true },
          { label: "Sem retrospectiva formal", value: 41 },
        ],
        unit: "%",
      },
      {
        title: "Incidentes em produção por tipo de rollout",
        description:
          "Incidentes críticos reportados nas primeiras 72 horas após o lançamento.",
        series: [
          { label: "Rollout gradual com feature flag", value: 18, highlight: true },
          { label: "Rollout total direto", value: 74 },
        ],
        unit: "índice relativo",
      },
    ],
    timeline: {
      title: "Adoção da funcionalidade ao longo do tempo",
      description:
        "Curva de adoção observada em iniciativas com rollout gradual, feature flag e comunicação prévia com CS e Suporte.",
      unit: "%",
      points: [
        { label: "D1", value: 12, caption: "grupo inicial" },
        { label: "D3", value: 28, caption: "expansão controlada" },
        { label: "D7", value: 54, caption: "abertura ampliada" },
        { label: "D14", value: 71, caption: "público-alvo parcial" },
        { label: "D30", value: 86, caption: "público-alvo completo" },
      ],
    },
  },

  intermission: {
    kind: "river" as const,
    eyebrow: "Metáfora",
    title: "Rio abaixo",
    body: "A corrente não volta. O trabalho do trio é ler o curso enquanto ele desce — e corrigir a direção a tempo.",
  },

  stakeholders: {
    eyebrow: "Quem participa",
    title: "O ciclo é operado por múltiplas mãos",
    description:
      "O Downstream é formalmente liderado pelo trio — PM, Design e Engineering — mas o ciclo só fecha quando outras áreas entram em cena no momento certo.",
    items: [
      {
        code: "01",
        role: "Product Manager",
        focus: "Critérios de aceite, métricas e decisão de próximo passo.",
      },
      {
        code: "02",
        role: "Tech Lead",
        focus: "Quebra técnica, qualidade, rollout e monitoramento.",
      },
      {
        code: "03",
        role: "Product Designer",
        focus: "Estados finais, edge cases e polimento de UX.",
      },
      {
        code: "04",
        role: "Product Marketing",
        focus: "Comunicação, timing e narrativa externa do lançamento.",
      },
      {
        code: "05",
        role: "Customer Success",
        focus: "Preparação da base, comunicação com contas estratégicas.",
      },
      {
        code: "06",
        role: "Suporte",
        focus: "Treinamento, artigos de ajuda, triagem pós-lançamento.",
      },
      {
        code: "07",
        role: "Data",
        focus: "Instrumentação, pipelines e dashboards de acompanhamento.",
      },
      {
        code: "08",
        role: "Segurança",
        focus: "Revisão de risco e conformidade antes do rollout.",
      },
    ],
  },

  voices: {
    label: "Vozes do time",
    intro:
      "Como cada papel do trio experimenta a travessia do Downstream. Vozes compostas a partir da prática de diferentes iniciativas.",
    quotes: [
      {
        body: "O handoff é onde o ciclo vive ou morre. Quando Engineering sai da sessão sem dúvidas, com critérios de aceite verificáveis e dependências mapeadas, o resto é execução. Quando sai com ambiguidades, todo mundo paga juros durante o sprint inteiro.",
        role: "Product Manager",
        context: "Fase 01 · Handoff",
      },
      {
        body: "A diferença entre um build saudável e um build perdido está na demo semanal. Ver o incremento funcionando com dado real corta pela raiz a conversa de Google Chat sobre o que cada um achou que era para fazer. Se o escopo não cabe, a gente renegocia na hora — não na última sexta-feira.",
        role: "Tech Lead",
        context: "Fase 02 · Build",
      },
      {
        body: "Design não termina na entrega do protótipo. Os estados de erro, de vazio, de carregamento são o que separa uma funcionalidade polida de uma que parece um beta. A revisão antes do lançamento é onde esses detalhes aparecem, e é quando mais precisam de atenção.",
        role: "Product Designer",
        context: "Fase 02 · Qualidade",
      },
      {
        body: "Um lançamento sem plano de comunicação não é um lançamento, é uma surpresa. CS e Suporte precisam saber o que muda antes do primeiro usuário receber. O rollout gradual compra o tempo para ajustar a narrativa com base em como o mercado reage.",
        role: "Product Marketing Manager",
        context: "Fase 03 · Lançamento",
      },
    ],
  },

  plans: {
    label: "Compromissos de saída",
    intro:
      "Toda iniciativa que completa o Downstream produz três artefatos. Eles são o contrato do trio com o resto da companhia — e o ponto de partida do próximo ciclo.",
    items: [
      {
        number: "01",
        title: "Funcionalidade em produção",
        body: "Ativa para o público-alvo com feature flag controlada e monitoramento ativo. Dona por Engineering, com PM validando critérios de aceite e Design polindo estados finais.",
      },
      {
        number: "02",
        title: "Dashboard de métricas",
        body: "Métrica principal, de proteção e sinal de curto prazo instrumentados, com linha de base e meta visíveis. Dono por PM, com leitura clara o suficiente para stakeholders externos ao trio.",
      },
      {
        number: "03",
        title: "Retrospectiva documentada",
        body: "Resultado comparado à expectativa, aprendizados técnicos e de UX registrados, e próximo passo definido. Dona por PM, com contribuições diretas de Engineering, Design e Marketing.",
      },
    ],
  },

  appendix: {
    label: "Appendix",
    footnotes: [
      {
        number: "1",
        html: 'O termo <em>downstream</em> vem da metáfora do rio: tudo que acontece a jusante de uma nascente. No nosso processo, a nascente é o Upstream — onde a hipótese é formulada e validada. O Downstream é para onde essa hipótese flui até encontrar o usuário.',
      },
      {
        number: "2",
        html: '<strong>Bug crítico</strong>: impede a tarefa principal ou causa perda de dados. Bloqueia o lançamento. <strong>Bug aceitável</strong>: tudo o mais, podendo ser priorizado pós-lançamento sem comprometer o resultado da iniciativa.',
      },
      {
        number: "3",
        html: 'Uma iniciativa é considerada <em>concluída</em> quando o critério de sucesso é atingido ou quando a hipótese é invalidada, em ambos os casos com aprendizado registrado. Pausar ou encerrar sem documentar não fecha o ciclo.',
      },
    ],
  },

  footer: {
    quote: "Ciclo fechado = resultado medido + aprendizado registrado.",
    brand: "ZapSign · Time de Produto",
    meta: "Guia interno · Abril 2026",
  },
};
