export const rolesGlasswingData = {
  topbar: {
    brand: "ZapSign | Product Hubble",
  },

  hero: {
    eyebrow: "Guideline",
    title: "Papéis & Responsabilidades",
    subtitle: "Quem decide o quê, com quem e em que momento.",
    continueLabel: "Continuar lendo",
  },

  introduction: {
    label: "Introdução",
    paragraphs: [
      "Conflitos em equipes de produto raramente são de pessoas. Quase sempre são de contrato: dois papéis acham que decidem a mesma coisa, ou ninguém acha que decide, e o problema fica parado. Clareza de papel não é burocracia — é o que permite discordar rápido e decidir mais rápido ainda.",
      "Este guia descreve os papéis que operam o ciclo de produto na ZapSign: Product Manager, Product Designer, Tech Lead, Engineering Manager e Engineer. Para cada um, descrevemos o que lidera, o que contribui e o que não deve assumir. A fronteira entre papéis é mais importante do que a lista de tarefas que cabe em cada caixa.",
      "O documento é prescritivo onde pode ser e aberto onde o contexto manda. Funções pequenas demais para justificar todos os papéis ainda precisam cobrir todas as responsabilidades — alguém assume dois chapéus, e isso fica explícito em vez de implícito.",
    ],
  },

  context: {
    label: "Por que escrever isso",
    paragraphs: [
      "Papéis mal definidos produzem sintomas previsíveis. Decisões que voltam à pauta toda semana porque ninguém fechou. Protótipos que chegam ao build sem critério de aceite porque o PM achou que o Design validaria e o Design achou que o PM escreveria. Sprints que descarrilham porque o Tech Lead esperou o Engineering Manager remover um bloqueio — e vice-versa.",
      "A resposta não é reunir mais gente em cada decisão. É o oposto: tornar explícito quem decide, quem é consultado e quem apenas é informado. Esse contrato libera o time da reunião defensiva, onde ninguém discorda porque ninguém quer assinar em cima.",
      "Os papéis aqui descritos são perfis profissionais, não pessoas. Uma pessoa pode ocupar mais de um papel temporariamente — um Tech Lead que também faz Engineering Manager, um PM que assume discovery sem Designer. O que não pode é ficar ambíguo. Se dois papéis estão sendo ocupados pela mesma pessoa, ela precisa saber qual dos dois está exercendo em cada decisão.",
      "Este guia complementa os guias de Upstream e Downstream. Lá descrevemos como o ciclo acontece; aqui, quem faz o quê ao longo dele.",
    ],
  },

  intermission: {
    kind: "ladder" as const,
    eyebrow: "Metáfora",
    title: "Cada papel, uma pauta",
    body: "Um time de produto é uma orquestra pequena. Cada instrumento tem pauta própria — e o que importa é a música que sai, não quem tocou mais notas.",
  },

  phases: {
    label: "Os cinco papéis",
    intro:
      "Cada papel carrega uma pergunta central que ele é o primeiro a responder. Quando a pergunta muda de dono, o papel muda de nome.",
    items: [
      {
        number: "01",
        name: "Product Manager",
        question: "O que resolver e como saber que resolvemos?",
        body: "Dono do problema. Decide o que entra no ciclo, define como o sucesso será medido e fecha o ciclo com retrospectiva e próximo passo.",
        leads: [
          "Ponto de partida e critério de sucesso.",
          "Priorização e renegociação de escopo.",
          "Rollout: critério de expansão e de reversão.",
          "Retrospectiva documentada.",
        ],
        contributes: [
          "Design · sinais de fricção em pesquisa.",
          "Tech Lead · restrições técnicas no enquadramento.",
          "Engineering Manager · capacidade e prazo.",
        ],
        doesNotOwn: [
          "Escolha de stack ou arquitetura.",
          "Desenho visual da solução.",
          "Implementação e code review.",
        ],
      },
      {
        number: "02",
        name: "Product Designer",
        question: "Qual é a experiência certa para resolver esse problema?",
        body: "Dono da experiência. Traduz o problema em direções, valida com usuários e entrega protótipos com todos os estados cobertos — caminho feliz, erros, vazio, carregamento, edge cases.",
        leads: [
          "Direções exploradas em rascunho antes do Figma.",
          "Validação com 3–5 usuários antes do build.",
          "Protótipo em alta fidelidade com todos os estados.",
          "Polimento antes do lançamento.",
        ],
        contributes: [
          "Product Manager · regras de negócio no fluxo.",
          "Tech Lead · viabilidade das direções exploradas.",
          "Engineer · pareamento em estados complexos.",
        ],
        doesNotOwn: [
          "Priorização do backlog.",
          "Definição da métrica de sucesso.",
          "Arquitetura técnica e stack.",
        ],
      },
      {
        number: "03",
        name: "Tech Lead",
        question: "Como construímos isso com qualidade e no prazo?",
        body: "Dono da execução técnica. Quebra o backlog, define arquitetura, garante qualidade e assina o rollout do ponto de vista técnico — feature flag, observabilidade, critério de reversão.",
        leads: [
          "Quebra e estimativas que refletem complexidade real.",
          "Demos semanais com incremento em dado real.",
          "Feature flag, observabilidade e reversão prontos.",
          "Code review que ensina, não apenas aprova.",
        ],
        contributes: [
          "Engineer · implementação, testes e review.",
          "Product Manager · trade-offs de escopo no prazo.",
          "Engineering Manager · bloqueios não-técnicos.",
        ],
        doesNotOwn: [
          "Priorização de produto.",
          "Liderança de pessoa (carreira, 1:1).",
          "Decisão final de expansão ou reversão.",
        ],
      },
      {
        number: "04",
        name: "Engineering Manager",
        question: "O time está saudável, entregando e crescendo?",
        body: "Dono da saúde do time. Cuida de carreira, contratação, rituais e remoção de bloqueios organizacionais. Trabalha em par com o Tech Lead: TL responde pelo o quê técnico, EM pelo como o time chega lá.",
        leads: [
          "1:1 em cadência com foco em contexto e carreira.",
          "Leitura de sinais de ritmo — throughput, ciclo, qualidade.",
          "Remoção de dependências organizacionais.",
          "Contratação, onboarding e plano de crescimento.",
        ],
        contributes: [
          "Tech Lead · sinais de qualidade e time técnico.",
          "Product Manager · previsibilidade e capacidade.",
          "Engineer · feedback sobre rituais e contexto.",
        ],
        doesNotOwn: [
          "Arquitetura e escolha de stack.",
          "Code review de mérito técnico.",
          "Definição de métrica de produto.",
        ],
      },
      {
        number: "05",
        name: "Engineer",
        question: "Esse código resolve o problema e dura?",
        body: "Dono do ofício. Transforma especificação em código que funciona, é testado, é legível e resiste ao tempo. Observa a própria entrega em produção depois do merge.",
        leads: [
          "Perguntas no handoff — antes do primeiro commit.",
          "Testes no caminho feliz e em pelo menos um edge case.",
          "Code review que propõe e questiona.",
          "Observação pós-lançamento do que instrumentou.",
        ],
        contributes: [
          "Tech Lead · direção técnica e padrões.",
          "Product Designer · pareamento em estados complexos.",
          "Product Manager · clarificação de regras durante o build.",
        ],
        doesNotOwn: [
          "Priorização de produto.",
          "Arquitetura macro do sistema.",
          "Definição de rollout e feature flag.",
        ],
      },
    ],
  },

  decisions: {
    label: "Quando os papéis se cruzam",
    intro:
      "A maior parte das decisões de um ciclo é óbvia — alguém decide e o time segue. O problema aparece na fronteira, onde dois papéis legítimos discordam. Esta é a matriz que o time usa antes de entrar no conflito, não no meio dele.",
    legend: [
      { code: "D", label: "Decide" },
      { code: "C", label: "Consultado" },
      { code: "I", label: "Informado" },
      { code: "—", label: "Fora do papel" },
    ],
    roles: [
      { code: "PM", label: "Product Manager" },
      { code: "PD", label: "Product Designer" },
      { code: "TL", label: "Tech Lead" },
      { code: "EM", label: "Engineering Manager" },
      { code: "Eng", label: "Engineer" },
    ],
    rows: [
      {
        title: "Métrica de sucesso",
        context: "Qual número prova que a iniciativa valeu a pena.",
        values: ["D", "C", "C", "—", "—"],
      },
      {
        title: "Priorização no sprint",
        context: "Item novo entra no meio do sprint — o que sai.",
        values: ["D", "C", "C", "I", "—"],
      },
      {
        title: "Direção de design",
        context: "Qual proposta vai para validação e qual fica no papel.",
        values: ["C", "D", "C", "—", "—"],
      },
      {
        title: "Arquitetura e stack",
        context: "Biblioteca, padrão de integração ou limite de serviço.",
        values: ["I", "—", "D", "C", "C"],
      },
      {
        title: "Protótipo congelado",
        context: "Quando o protótipo pode ir para handoff.",
        values: ["C", "D", "C", "—", "—"],
      },
      {
        title: "Feature flag e reversão",
        context: "Como o rollout é controlado e desligado em crise.",
        values: ["C", "—", "D", "I", "C"],
      },
      {
        title: "Expansão do rollout",
        context: "Avançar para mais usuários — ou voltar.",
        values: ["D", "—", "C", "I", "—"],
      },
      {
        title: "Contratação do time",
        context: "Abrir vaga, avaliar e fechar candidato.",
        values: ["—", "—", "C", "D", "C"],
      },
      {
        title: "Próximo passo após o ciclo",
        context: "Iterar, expandir, pausar ou encerrar.",
        values: ["D", "C", "C", "C", "C"],
      },
    ],
  },

  stakeholders: {
    eyebrow: "Quem mais aparece",
    title: "O ciclo depende de papéis fora do time",
    description:
      "Os cinco papéis centrais não operam sozinhos. Em momentos específicos, outras funções entram em cena com responsabilidade clara. Este é o mapa da extensão.",
    items: [
      {
        code: "01",
        role: "Product Manager",
        focus: "Problema, métrica, escopo, retrospectiva.",
      },
      {
        code: "02",
        role: "Product Designer",
        focus: "Experiência, validação, estados finais, polimento.",
      },
      {
        code: "03",
        role: "Tech Lead",
        focus: "Arquitetura, qualidade, rollout técnico.",
      },
      {
        code: "04",
        role: "Engineering Manager",
        focus: "Saúde do time, entrega, carreira, contratação.",
      },
      {
        code: "05",
        role: "Engineer",
        focus: "Implementação, testes, revisão, observação.",
      },
      {
        code: "06",
        role: "Data",
        focus: "Instrumentação, linha de base, leitura de sinais.",
      },
      {
        code: "07",
        role: "Customer Success",
        focus: "Voz do cliente e comunicação com contas-chave.",
      },
      {
        code: "08",
        role: "Suporte",
        focus: "Triagem pós-lançamento e sinais silenciosos.",
      },
      {
        code: "09",
        role: "Product Marketing",
        focus: "Narrativa, timing e posicionamento externo.",
      },
      {
        code: "10",
        role: "Segurança / Jurídico",
        focus: "Restrições regulatórias consultadas cedo.",
      },
    ],
  },

  voices: {
    label: "Vozes do time",
    intro:
      "Como cada papel vê o próprio contrato. Vozes compostas a partir da prática — o que funciona bem e o que quebra quando o papel fica ambíguo.",
    quotes: [
      {
        body: "Meu trabalho não é decidir tudo. É garantir que a decisão certa seja tomada pela pessoa certa e no momento certo. Quando eu resolvo sozinho o que o Design deveria validar, engano a mim mesmo — e a conta chega depois, em forma de feature que ninguém usa.",
        role: "Product Manager",
        context: "Sobre fronteiras de decisão",
      },
      {
        body: "A pior hora para discutir a direção é quando ela já está em Figma. Rascunho em papel é debate honesto; wireframe colorido é apego. Exercer o papel é segurar o lápis mais tempo do que parece confortável para o resto do time.",
        role: "Product Designer",
        context: "Sobre exploração",
      },
      {
        body: "Tech Lead que faz tudo sozinho é gargalo com jaqueta de herói. Meu trabalho é ensinar o time a decidir sem mim — na arquitetura, no review, na escolha de trade-off. Se eu for o único que sabe por que a coisa é daquele jeito, o time tem um problema.",
        role: "Tech Lead",
        context: "Sobre delegar direção técnica",
      },
      {
        body: "Não lidero o build. Eu lidero as pessoas que lideram o build. Meu papel começa quando alguém está travado por um motivo que não é técnico — falta de contexto, de prioridade, de energia, de clareza sobre o próprio próximo passo.",
        role: "Engineering Manager",
        context: "Sobre o que é do EM e do TL",
      },
      {
        body: "Ser engenheiro sênior não é escrever mais código. É fazer as perguntas certas no handoff, participar do review como quem está aprendendo, e acompanhar o que construiu depois que foi para produção. A entrega não termina no merge.",
        role: "Engineer",
        context: "Sobre senioridade",
      },
    ],
  },

  plans: {
    label: "Contratos de saída",
    intro:
      "Todo papel produz artefatos que o resto do time pode cobrar. Eles são a forma concreta da responsabilidade — e o que diferencia o papel exercido do papel reivindicado.",
    items: [
      {
        number: "01",
        title: "Product Manager",
        body: "Ponto de partida escrito, critério de sucesso acordado, dashboard de métricas acompanhado em tempo real e retrospectiva documentada no final do ciclo. Se não existe retrospectiva, o ciclo não fechou.",
      },
      {
        number: "02",
        title: "Product Designer",
        body: "Direções exploradas em rascunho, validação com usuários registrada, protótipo em alta fidelidade com todos os estados e revisão de polimento antes do lançamento. O protótipo é contrato, não sugestão.",
      },
      {
        number: "03",
        title: "Tech Lead",
        body: "Backlog quebrado e sequenciado, demos semanais com incremento funcional, rollout com feature flag e critério de reversão. O rollout é executado — não apenas planejado.",
      },
      {
        number: "04",
        title: "Engineering Manager",
        body: "1:1 em cadência, leitura dos sinais de ritmo do time, plano de carreira para cada pessoa e remoção de bloqueios organizacionais documentada. Saúde do time é indicador, não sensação.",
      },
      {
        number: "05",
        title: "Engineer",
        body: "Código em produção, testes escritos, review feito com atenção e acompanhamento pós-lançamento do que instrumentou. O que foi entregue precisa ser observável por quem o entregou.",
      },
    ],
  },

  appendix: {
    label: "Appendix",
    footnotes: [
      {
        number: "1",
        html: 'O termo <em>trio</em> se refere aos três papéis que sustentam a formulação e entrega de uma iniciativa: Product Manager, Product Designer e Tech Lead. Engineering Manager e Engineers são parte do time estendido, com responsabilidades adjacentes e complementares.',
      },
      {
        number: "2",
        html: '<strong>Responsabilidade</strong> ≠ <strong>tarefa</strong>. Um Tech Lead é responsável por qualidade de código mesmo quando não é ele quem escreve. O papel responde pelo resultado, não apenas pela execução da parte dele.',
      },
      {
        number: "3",
        html: 'Em squads pequenos, um mesmo profissional pode ocupar mais de um papel. O que não pode é deixar implícito qual papel está sendo exercido em cada decisão. Quando a mesma pessoa é TL e EM, ela precisa sinalizar qual dos dois chapéus está usando — especialmente em conflitos de prazo e pessoas.',
      },
      {
        number: "4",
        html: 'Este guia complementa os guias de <strong>Upstream</strong> e <strong>Downstream</strong>. Lá, o ciclo é descrito em fases; aqui, em papéis. As duas leituras juntas formam o contrato completo do time de produto da ZapSign.',
      },
    ],
  },

  footer: {
    quote: "Papel claro não é burocracia. É o que permite discordar rápido e decidir mais rápido ainda.",
    brand: "ZapSign · Time de Produto",
    meta: "Guia interno · Abril 2026",
  },
};
