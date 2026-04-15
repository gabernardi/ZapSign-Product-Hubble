export const managementTipsData = {
  header: {
    pill: "Guia de Liderança · Produto & Engenharia",
    title: "Liderança na Prática",
    description:
      "O que separa bons líderes dos excelentes não é talento. É prática deliberada.",
    meta: {
      label: "ZapSign · Produto & Engenharia",
      detail: "Versão 1.0 · Abril 2026",
    },
  },

  principles: [
    {
      number: "01",
      title: "Sintetize, não resuma",
      body: 'Resumir é condensar. Sintetizar é responder "e daí?". Comece sempre pelo segundo.',
    },
    {
      number: "02",
      title: "Empatia vem primeiro",
      body: "Entenda como o outro pensa e sente antes de abrir a boca. A ordem importa.",
    },
    {
      number: "03",
      title: "Mentalidade define direção",
      body: "Perceber o próprio estado mental já é metade do caminho para mudar a resposta.",
    },
    {
      number: "04",
      title: "Hábitos vencem motivação",
      body: "Motivação vai e volta. Um bom sistema de gatilho, rotina e recompensa fica.",
    },
  ],

  startingPoints: [
    {
      id: "open-narrow-close" as const,
      color: "blue" as const,
      title: "Reuniões e alinhamentos",
      body: "Reunião sem decisão nem próximo passo é tempo perdido. Três movimentos resolvem: abrir, afunilar, fechar.",
      focusLabel: "Aplique",
      focusValue: "Abrir, Afunilar, Fechar",
    },
    {
      id: "escuta-avec" as const,
      color: "amber" as const,
      title: "Feedback e 1:1s",
      body: "Bom feedback começa com escuta de verdade. O objetivo é ajudar o outro a crescer, não corrigi-lo.",
      focusLabel: "Aplique",
      focusValue: "Escuta ativa + AVEC",
    },
    {
      id: "apr" as const,
      color: "teal" as const,
      title: "Momentos de pressão",
      body: "Pressão ativa o piloto automático. Quem aprende a pausar antes de reagir muda a qualidade de tudo que faz.",
      focusLabel: "Aplique",
      focusValue: "Técnica APR",
    },
    {
      id: "reach" as const,
      color: "purple" as const,
      title: "Formação de time",
      body: "Antes de cobrar execução, garanta que as pessoas se sentem seguras para falar o que pensam de verdade.",
      focusLabel: "Aplique",
      focusValue: "Modelo REACH",
    },
  ],

  step1: {
    stepNumber: 1,
    stepLabel: "Prática 01",
    timeChip: "Toda interação",
    title: "Comunique com o Método EPIC",
    description:
      "A maioria dos problemas de comunicação não vem de falta de informação. Vem de falta de estrutura. EPIC organiza qualquer conversa em quatro passos simples.",
    output: "Conversas com mais clareza, empatia e resultado",
    template: {
      label: "EPIC: quatro passos para comunicar melhor",
      rows: [
        {
          key: "Empatia",
          value:
            "Como essa pessoa está se sentindo agora? Comece entendendo o outro antes de falar.",
        },
        {
          key: "Propósito",
          value:
            "O que vocês dois precisam sair sabendo dessa conversa? Deixe claro desde o início.",
        },
        {
          key: "Ideias",
          value:
            "Vá direto ao ponto. Mensagem principal primeiro, argumentos depois.",
        },
        {
          key: "Conversa",
          value:
            "Abra com contexto, aprofunde com perguntas, feche com próximos passos.",
        },
      ],
    },
    columns: [
      {
        label: "Como praticar",
        items: [
          "Antes da reunião, escreva uma frase sobre como o outro se sente",
          "Defina o propósito em uma frase antes de começar",
          "Comece pela conclusão, não pela cronologia",
          "Termine toda conversa com um próximo passo e um dono",
        ],
      },
      {
        label: "Sinais de que funciona",
        items: [
          "O outro repete a mensagem principal com as próprias palavras",
          "Ninguém sai da conversa surpreso com o que foi decidido",
          "Críticas são recebidas com abertura, não com defesa",
          "A conversa termina com ação, não só com entendimento",
        ],
      },
    ],
  },

  step2: {
    stepNumber: 2,
    stepLabel: "Prática 02",
    timeChip: "Apresentações e documentos",
    title: "Estruture com o Princípio da Pirâmide",
    description:
      "Quando a informação é complexa, a ordem muda tudo. A Pirâmide inverte o instinto natural: em vez de contar a história do começo ao fim, você começa pela conclusão e sustenta com argumentos.",
    output: "Mensagens que levam a decisões mais rápidas",
    metrics: [
      {
        label: "Pensamento-guia",
        value: "Sua resposta em uma frase",
        description:
          "O que o outro precisa ouvir nos dois primeiros minutos",
      },
      {
        label: "Linhas-chave",
        value: "3 a 5 argumentos de sustentação",
        description:
          "Cada um sintetiza um grupo de fatos, sem sobreposição",
      },
      {
        label: "Dados de suporte",
        value: "Evidências por argumento",
        description: "Fatos relevantes e suficientes, sem lacunas",
      },
    ],
    columns: [
      {
        label: "Síntese vs. resumo",
        labelColor: "blue" as const,
        bgColor: "blue" as const,
        items: [
          'Resumo: "Ouvimos reclamações sobre retorno, espera e cadastro"',
          'Síntese: "Clientes querem reduzir o tempo entre entrar e sair da loja"',
          "Síntese responde ao 'e daí?'. Resumo só encurta",
          "Comece sempre pela conclusão, não pela lista",
        ],
      },
      {
        label: "Quando usar",
        items: [
          "E-mails com mais de dois parágrafos",
          "Apresentações para liderança",
          "Documentos de proposta ou decisão",
          "Qualquer momento em que você precisa convencer alguém",
        ],
      },
    ],
    note: "<strong>Teste rápido.</strong> Leia só a primeira frase do seu documento. Dá para entender o que você propõe e por quê? Se não, a pirâmide ainda não está pronta.",
  },

  bridge1: {
    label: "Transição",
    html: 'Comunicação clara é a base. <strong>A próxima pergunta: como construir um time que funciona bem junto?</strong>',
  },

  step3: {
    stepNumber: 3,
    stepLabel: "Prática 03",
    timeChip: "Momentos de pressão",
    title: "Use APR nos Momentos Difíceis",
    description:
      "Sob pressão, todo mundo reage no automático. APR é uma técnica simples para interromper esse padrão: perceba o que está sentindo, dê uma pausa e olhe a situação por outro ângulo.",
    output: "Respostas mais conscientes quando a pressão aperta",
    template: {
      label: "APR: três passos para reenquadrar",
      rows: [
        {
          key: "Perceber",
          value:
            "Note que você está no piloto automático. O que está sentindo? Que história está contando para si mesmo?",
        },
        {
          key: "Pausar",
          value:
            "Respire. Não reaja ainda. Crie um espaço entre o que aconteceu e o que você vai fazer.",
        },
        {
          key: "Reenquadrar",
          value:
            "Faça uma pergunta diferente. E se essa situação for uma oportunidade que você ainda não enxergou?",
        },
      ],
    },
    columns: [
      {
        label: "Mentalidades que ajudam",
        labelColor: "green" as const,
        bgColor: "green" as const,
        items: [
          '"Não controlo a situação, mas controlo minha resposta"',
          '"O que posso aprender com isso?"',
          '"Qual é a menor ação útil agora?"',
          '"Errar é parte do processo, não o fim dele"',
        ],
      },
      {
        label: "Mentalidades que travam",
        items: [
          '"Isso nunca vai funcionar": paralisa antes de tentar',
          '"A culpa é do outro": joga a responsabilidade para fora',
          '"Eu deveria saber disso": gera vergonha em vez de aprendizado',
          '"Não tenho tempo para parar": mantém o ciclo de reação',
        ],
      },
    ],
    note: "<strong>No dia a dia.</strong> Prazo estourado, erro em produção, mudança de escopo. São os melhores momentos para praticar. Dez segundos de pausa antes de responder um Slack urgente já mudam o tom de tudo.",
  },

  step4: {
    stepNumber: 4,
    stepLabel: "Prática 04",
    timeChip: "Contínuo",
    title: "Crie Segurança Psicológica com REACH",
    description:
      "Times que aprendem rápido precisam de um ambiente onde errar não dá medo. Segurança psicológica não é ser gentil o tempo todo. É garantir que as pessoas digam o que realmente pensam.",
    output: "Um time que fala com honestidade e aprende junto",
    columns: [
      {
        label: "Modelo REACH: 4 ações",
        labelColor: "blue" as const,
        bgColor: "blue" as const,
        items: [
          "Ressignifique erros: trate como aprendizado, não como falha",
          "Encoraje todas as vozes: peça a opinião de quem está quieto",
          "Valorize contribuições: reconheça de forma específica, não genérica",
          "Desenvolva os outros: ajude a encontrar a resposta, não entregue pronta",
        ],
      },
      {
        label: "Relacionamentos fortes com AVEC",
        labelColor: "green" as const,
        bgColor: "green" as const,
        items: [
          "Atenção: escute de verdade, sem planejar sua resposta enquanto o outro fala",
          "Vulnerabilidade: admita o que errou e o que não sabe",
          "Empatia: entenda o que o outro sente a partir do que ele conta",
          "Compaixão: pergunte como a pessoa está e invista tempo na resposta",
        ],
      },
    ],
    note: "<strong>Um sinal de alerta.</strong> Se ninguém discorda de você em uma semana inteira, provavelmente não é porque suas ideias são perfeitas.",
  },

  iteration: {
    header:
      "Liderança se pratica, não se estuda",
    items: [
      {
        number: "01",
        name: "Observar",
        description: "Note seus padrões",
      },
      {
        number: "02",
        name: "Pausar",
        description: "Crie espaço",
      },
      {
        number: "03",
        name: "Reenquadrar",
        description: "Mude o ângulo",
      },
      {
        number: "04",
        name: "Praticar",
        description: "Repita até virar hábito",
      },
      {
        number: "05",
        name: "Refletir",
        description: "O que funcionou?",
      },
    ],
  },

  bridge2: {
    label: "Transição",
    html: 'O time está funcionando. <strong>Agora: como você se desenvolve como líder?</strong>',
  },

  step5: {
    stepNumber: 5,
    stepLabel: "Prática 05",
    timeChip: "Diário",
    title: "Transforme Práticas em Hábitos",
    description:
      "Um comportamento praticado por dois meses vira hábito. Mas tempo sozinho não basta. Você precisa de um gatilho que dispara a ação, uma rotina clara e uma recompensa que faz você querer repetir.",
    output: "Boas práticas que se sustentam sozinhas",
    fidelity: [
      { label: "Gatilho", description: "O que dispara" },
      { label: "Rotina", description: "O que você faz" },
      { label: "Recompensa", description: "O que reforça" },
      { label: "Hábito", description: "O que fica" },
    ],
    columns: [
      {
        label: "Exemplos práticos",
        items: [
          "Gatilho: segunda de manhã → Rotina: revisar métricas e saúde do sistema → Recompensa: clareza para priorizar a semana",
          "Gatilho: antes do 1:1 → Rotina: anotar 1 reconhecimento → Recompensa: conversa mais conectada",
          "Gatilho: depois de um deploy → Rotina: olhar métricas no 1º, 7º e 30º dia → Recompensa: decisão por dado",
          "Gatilho: fim do dia → Rotina: registrar 1 aprendizado → Recompensa: progresso visível no mês",
        ],
      },
      {
        label: "Perguntas para montar seu ciclo",
        items: [
          "Que momento específico vai disparar esse hábito?",
          "Qual é o menor passo possível que ainda vale a pena?",
          "O que vai fazer você querer repetir amanhã?",
          "O que precisa desaprender para dar espaço ao novo?",
        ],
      },
    ],
    note: "<strong>Comece pequeno.</strong> Escolha um hábito. Pratique por 30 dias. Só depois adicione o próximo. Consistência bate ambição.",
  },

  step6: {
    stepNumber: 6,
    stepLabel: "Prática 06",
    timeChip: "Semanal",
    title: "Cuide da Sua Energia",
    description:
      "Sua energia como líder é contagiosa. Líder esgotado toma decisões piores e arrasta o time junto. Cuidar de si não é luxo. É o que sustenta tudo o mais.",
    output: "Energia para liderar com consistência",
    metrics: [
      {
        label: "Físico",
        value: "Sono, exercício, nutrição",
        description:
          "A base de tudo. Sem sono, nada funciona direito.",
      },
      {
        label: "Mental",
        value: "Foco, silêncio, hobbies",
        description:
          "Tempo sem tela, atividades que restauram a concentração.",
      },
      {
        label: "Social",
        value: "Vínculos, conexão",
        description:
          "Relacionamentos genuínos dentro e fora do trabalho.",
      },
      {
        label: "Espiritual",
        value: "Propósito, significado",
        description:
          "Conexão com algo maior. O que faz tudo valer a pena?",
      },
    ],
    columns: [
      {
        label: "Seja referência",
        labelColor: "blue" as const,
        bgColor: "blue" as const,
        items: [
          "Compartilhe o que está funcionando e o que não está",
          "Defina seus limites e comunique ao time",
          "Celebre conquistas individuais, mesmo as pequenas",
          "Crie normas de time que protejam o bem-estar de todos",
        ],
      },
      {
        label: "Checagem rápida",
        items: [
          "Dormi bem?",
          "Sei o que quero do dia de hoje?",
          "Estou com energia ou só com obrigação?",
          "Me sinto conectado com quem importa?",
        ],
      },
    ],
    note: "<strong>Regra simples.</strong> Se sua energia está abaixo de 5 em 10, trate como impedimento, não como fraqueza. Quem cuida de si dá permissão para o time fazer o mesmo.",
  },

  deliverables: {
    chip: "Conclusões",
    title: "O que levar daqui",
    subtitle:
      "Três combinações para aplicar a partir de hoje.",
    items: [
      {
        number: "01",
        title: "EPIC + Pirâmide",
        description:
          "Comece por entender o outro. Depois vá direto ao ponto, sempre pela conclusão.",
      },
      {
        number: "02",
        title: "APR + REACH",
        description:
          "Pause antes de reagir. Crie um ambiente onde as pessoas falam o que realmente pensam.",
      },
      {
        number: "03",
        title: "Hábitos + Energia",
        description:
          "Monte gatilhos claros para boas práticas. E cuide da sua energia como cuida do que entrega.",
      },
    ],
  },

  footer: {
    quote:
      "Liderança não é cargo. É o que você pratica todo dia.",
    brand: "ZapSign · Produto & Engenharia",
  },
};
