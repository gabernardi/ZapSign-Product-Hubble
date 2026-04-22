export interface ContribuirStep {
  number: string;
  duration: string;
  name: string;
  body: string;
  highlights: string[];
}

export interface ContribuirLocation {
  area: string;
  path: string;
  body: string;
  kind: "page" | "component" | "data" | "tokens";
}

export interface ContribuirPrinciple {
  number: string;
  title: string;
  body: string;
}

export interface ContribuirFaq {
  question: string;
  answer: string;
}

export interface ContribuirPossibility {
  scope: string;
  title: string;
  body: string;
}

export interface ContribuirTool {
  name: string;
  role: string;
  body: string;
  tip: string;
}

export type ContribuirExperimentStatus =
  | "andamento"
  | "beta"
  | "aberto"
  | "pausado"
  | "promovido";

export interface ContribuirExperiment {
  id: string;
  status: ContribuirExperimentStatus;
  statusLabel: string;
  title: string;
  hypothesis: string;
  lead: string;
  note: string;
  href?: string;
  hrefLabel?: string;
}

export const contribuirData = {
  topbar: {
    brand: "ZapSign | Product Hubble",
  },
  hero: {
    eyebrow: "Laboratório de produto",
    title: "Seu laboratório.",
    subtitle:
      "Espaço livre pra experimentar qualquer ideia — de uma funcionalidade nova pro core de assinatura a uma aposta que pode virar unidade de negócio nova.",
    continueLabel: "Começar",
  },
  experiments: {
    label: "Catálogo de experimentos.",
    intro:
      "O laboratório é feito do que já rodou nele. Esta é a lista viva — o que está em andamento, o que está em beta, o que está em aberto esperando quem queira puxar. Cada experimento tem uma hipótese, um lead e uma nota do que foi aprendido até agora. Quer abrir o LAB-00X seguinte? Adiciona aqui no PR.",
    items: [
      {
        id: "LAB-000",
        status: "andamento",
        statusLabel: "Em andamento",
        title: "Este guia é, ele mesmo, um experimento",
        hypothesis:
          "Um guia de produto vivo — editado por qualquer pessoa do time via pull request, com IA no fluxo e deploy automático — supera um Notion fechado em utilidade e engajamento real?",
        lead: "Gabriel",
        note: "Você está lendo agora. A hipótese se prova (ou não) no uso contínuo: no time voltando aqui, nos PRs que aparecem, nas ideias que nascem neste contexto.",
        href: "/dashboard",
        hrefLabel: "Abrir início",
      },
      {
        id: "LAB-001",
        status: "beta",
        statusLabel: "Beta",
        title: "Changelog auto-gerado da main",
        hypothesis:
          "Dá pra ter um changelog de produto genuinamente útil, com zero esforço manual, só a partir dos commits da branch principal — usando IA pra reescrever cada entrada em linguagem humana?",
        lead: "Gabriel",
        note: "Funciona parcialmente. Em beta, ainda evoluindo. Script lê o git log, infere áreas, pede título e descrição pra um modelo pequeno e guarda em cache no próprio repo — só commits novos custam token.",
        href: "/dashboard/changelog",
        hrefLabel: "Ver changelog",
      },
    ] satisfies ContribuirExperiment[],
  },
  introduction: {
    label: "O laboratório não é este site.",
    paragraphs: [
      "Laboratório aqui é mentalidade, não ferramenta. É o espaço onde o time leva a sério qualquer ideia que mereça ser testada — uma funcionalidade nova pro produto core de assinatura eletrônica, uma melhoria num fluxo que já está em produção, um protótipo de produto adjacente, uma aposta inteira que pode virar unidade de negócio nova. Nenhum escopo está fechado. Nenhuma ideia é pequena demais, nem grande demais, pra entrar.",
      "Este site é a forma mais acessível do laboratório. Repositório editável, deploy automático, IA integrada ao fluxo: se a sua ideia cabe em página, componente, conteúdo, rota nova ou visualização, dá pra experimentar direto aqui — clona, mexe, abre PR. Se a ideia é maior do que cabe num site de guidelines — um protótipo de feature do core, um motor de automação, uma bet de produto inteira, uma unidade nova —, o convite continua valendo. Só o canal muda: Figma rodando, Loom de 3 minutos, protótipo técnico em branch separada, demo pro time no 🛟 #Time - Produto do Google Chat. O laboratório vai até onde a sua ideia for.",
      "A régua é simples: se você achou que valia a pena fazer, vale a pena abrir a conversa. Pior que errar no experimento é não experimentar.",
    ],
  },
  principles: {
    label: "Três princípios, nada mais.",
    intro:
      "Tudo que não está aqui está aberto. Tudo que está aqui é pra proteger o time, não pra te travar.",
    items: [
      {
        number: "01",
        title: "Não peça permissão. Peça revisão.",
        body: "Quer prototipar uma funcionalidade nova pro core? Desenhar uma aposta que pode virar unidade? Criar uma página nova aqui? Faça primeiro, mostra depois. Dentro do site a conversa acontece no PR; fora, onde fizer mais sentido — protótipo rodando, Figma, Loom, demo no 🛟 #Time - Produto do Google Chat. O laboratório nunca teve gatekeeper, só reviewer.",
      },
      {
        number: "02",
        title: "Use IA como extensão, não como muleta.",
        body: "Cursor, Claude, Codex: são a forma padrão de trabalhar aqui. Cole contexto, peça pra eles desenharem componente, gerarem variações, implementarem ideia. Só não entregue o que você não entende — o PR é seu, a IA é ferramenta.",
      },
      {
        number: "03",
        title: "Respeite o design system — até decidir não respeitar.",
        body: "Tokens de cor, tipografia e espaçamento estão em globals.css e DESIGN_SYSTEM.md. Use. Se o experimento exigir quebrar, quebre — mas abra a discussão no PR pra gente decidir se a quebra vira sistema novo ou volta ao padrão.",
      },
    ] satisfies ContribuirPrinciple[],
  },
  intermission: {
    eyebrow: "O que significa na prática",
    title: "Cinco passos do clone ao deploy.",
    body: "O fluxo é o mesmo pra corrigir um typo ou pra criar uma página inteira do zero. Pequeno ou grande, o caminho é este — e cabe em um café.",
  },
  possibilities: {
    label: "O que cabe no laboratório.",
    intro:
      "Lista não-exaustiva do que o time já considera bem-vindo. As primeiras cabem dentro deste site; as últimas extrapolam e vão pro core, pra melhorias em produção ou pra apostas que podem virar produto novo. Se sua ideia não está aqui, ela também é bem-vinda.",
    items: [
      {
        scope: "Micro",
        title: "Corrigir um typo, trocar uma palavra",
        body: "Abriu a página, viu um erro, clonou, consertou, PR. Cinco minutos de ponta a ponta.",
      },
      {
        scope: "Pequeno",
        title: "Reescrever um parágrafo ou seção",
        body: "Achou que a introdução do Upstream está fraca? Reescreve. Precisa de contexto novo num squad do roadmap? Adiciona.",
      },
      {
        scope: "Médio",
        title: "Criar uma página nova",
        body: "Tem um guia interno na cabeça que não existe aqui? Cria a rota, desenha a estrutura, escreve. O template das existentes serve de ponto de partida.",
      },
      {
        scope: "Médio",
        title: "Experimentar um componente",
        body: "Um jeito novo de mostrar timeline, uma visualização diferente de squads, um card que ninguém tentou. Monta em components/, testa numa página, manda PR.",
      },
      {
        scope: "Grande",
        title: "Testar uma biblioteca ou padrão novo",
        body: "Framer Motion pra animações, uma lib de gráficos, um novo padrão de navegação. Experimentação técnica é parte do ofício.",
      },
      {
        scope: "Grande",
        title: "Prototipar com IA e virar página",
        body: "Abre o Cursor, conversa com o Claude, gera uma página inteira a partir de uma ideia. Revisa, ajusta, manda PR. Esse é o fluxo-padrão — não o exótico.",
      },
      {
        scope: "Core",
        title: "Prototipar uma funcionalidade nova pro core",
        body: "Um novo tipo de documento, uma automação no editor de assinatura, um fluxo que reduz fricção no envio. Monta o protótipo — em código, em Figma, em Loom — e traz pra conversa. Se vingar, entra no funil do roadmap como candidato real.",
      },
      {
        scope: "Core",
        title: "Melhoria num fluxo em produção",
        body: "Um ponto do onboarding que trava, um ajuste de copy num e-mail crítico, uma UX recorrente que incomoda cliente. Traz evidência e proposta. Melhoria incremental também é experimento — e costuma ser a mais barata de testar.",
      },
      {
        scope: "Aposta",
        title: "Prototipar uma aposta adjacente",
        body: "Uma ideia que não é o core de hoje, mas que faz sentido pro time olhar: produto irmão, integração que abre vertical, mercado novo. Monta o protótipo, mostra pro time, deixa a ideia viva. Aposta não precisa virar entrega amanhã — precisa ficar visível.",
      },
      {
        scope: "Aposta",
        title: "Desenhar uma nova unidade de negócio",
        body: "Ambicioso, e bem-vindo. Se você enxerga um produto que pode virar unidade nova dentro da ZapSign, o laboratório é o lugar pra começar. Pitch de uma página, protótipo rodando, research inicial — qualquer forma que torne a ideia concreta o bastante pra discutir.",
      },
    ] satisfies ContribuirPossibility[],
  },
  steps: {
    label: "Do clone ao deploy.",
    intro:
      "O caminho feliz assume que você tem acesso ao repositório privado da ZapSign no GitHub e o Cursor instalado. Se faltar algo, pula pro final — tem uma seção só pra desbloquear.",
    items: [
      {
        number: "01",
        duration: "5 min",
        name: "Clonar o repositório",
        body: "No GitHub, copie o link do repo product-zs e clone. Se você usa Cursor, clone direto pelo comando \"Clone repository\" — ele já abre o projeto pronto pra editar.",
        highlights: [
          "git clone git@github.com:zapsign/product-zs.git",
          "cd product-zs",
          "npm install",
          "npm run dev  →  abre em http://localhost:3000",
        ],
      },
      {
        number: "02",
        duration: "2 min",
        name: "Criar uma branch",
        body: "Nunca commite na main. Branch curta, descritiva, prefixo semântico (feat, fix, content, experiment). Pra experimentos exploratórios, use experiment/ — deixa claro pra quem revisa que a ideia é testar, não fechar.",
        highlights: [
          "git checkout -b feat/changelog-filtro-por-autor",
          "git checkout -b content/upstream-reescrita",
          "git checkout -b experiment/timeline-animada",
          "git checkout -b fix/typo-dashboard",
        ],
      },
      {
        number: "03",
        duration: "10 min → horas",
        name: "Editar, criar, experimentar",
        body: "Abra o Cursor. Use o chat e o agente com liberdade. Peça pra ele entender a estrutura, gerar componente novo, propor variações. A IA aqui não é opcional — é o jeito que a gente trabalha. Só entregue o que você leu e entendeu.",
        highlights: [
          "Conteúdo: lib/data/*.ts",
          "Estrutura: app/(authenticated)/dashboard/**/page.tsx",
          "Componentes: components/glasswing/ e components/guide/",
          "Tokens: app/globals.css  +  DESIGN_SYSTEM.md",
          "Cursor rules: .cursor/rules/  (a IA já conhece o design system daqui)",
        ],
      },
      {
        number: "04",
        duration: "5 min",
        name: "Commitar e abrir o PR",
        body: "Commits com prefixo semântico alimentam o changelog automático. O título do PR vira entrada na página de Changelog, então capricha. Na descrição, explica o experimento: o que testou, por que, o que aprendeu.",
        highlights: [
          'git commit -m "feat(roadmap): timeline animada experimental"',
          "git push -u origin experiment/timeline-animada",
          "Abra PR no GitHub com descrição do experimento",
          "Marque o Gabriel como reviewer",
        ],
      },
      {
        number: "05",
        duration: "Até 1 dia útil",
        name: "Revisão e deploy",
        body: "A revisão é conversa, não avaliação. Mesmo que o experimento não vá pra main como está, a discussão no PR já é o valor. Se for aprovado: merge → build → deploy automático → entrada no Changelog com seu nome.",
        highlights: [
          "Revisão síncrona quando dá, assíncrona quando não",
          "Ajustes via comentários ou commits novos na branch",
          "Experimento que não passou vira rascunho pra uma próxima ideia",
          "Merge na main dispara deploy automático no Vercel",
        ],
      },
    ] satisfies ContribuirStep[],
  },
  structure: {
    label: "Onde estão as coisas.",
    intro:
      "90% das edições acontecem em três lugares. Memorize esses três e você resolve quase tudo — inclusive criar página nova.",
    locations: [
      {
        area: "Conteúdo das páginas",
        path: "lib/data/",
        body: "Arquivos .ts com textos, listas, métricas e cards. Mexer aqui é suficiente pra atualizar texto, reordenar itens, adicionar card novo. Não precisa tocar em JSX.",
        kind: "data",
      },
      {
        area: "Estrutura de cada página",
        path: "app/(authenticated)/dashboard/**/page.tsx",
        body: "Como os blocos se combinam: quais componentes, em que ordem. Pra criar página nova, copie uma existente como template e vá adaptando — é o caminho mais rápido.",
        kind: "page",
      },
      {
        area: "Componentes reutilizáveis",
        path: "components/glasswing/ e components/guide/",
        body: "Blocos de construção. Se você se pegou reescrevendo o mesmo padrão em duas páginas, vira componente. Se você precisa de um visual que não existe, cria um novo.",
        kind: "component",
      },
      {
        area: "Design tokens",
        path: "app/globals.css  +  DESIGN_SYSTEM.md",
        body: "Cor, espaçamento, raio de borda, sombra. Use sempre token, nunca hex ou px avulso — a menos que o experimento exija. Aí abre no PR que a gente decide se vira sistema.",
        kind: "tokens",
      },
    ] satisfies ContribuirLocation[],
  },
  tools: {
    label: "Ferramentas do laboratório.",
    intro:
      "A gente não tem política de uso de IA aqui — tem cultura. Use. Quanto mais, melhor. O que importa é o que sai do seu PR, não como saiu.",
    items: [
      {
        name: "Cursor",
        role: "Editor de código · IDE principal",
        body: "O editor que o time usa. Já tem o agente, chat com contexto do repo, e conhece as regras do design system por causa de .cursor/rules/design-system.mdc. Peça pra ele criar componente, reescrever seção, gerar variação de layout, rodar mudança em massa.",
        tip: "Experimente o modo agente pra mudanças que tocam múltiplos arquivos. Peça pra ele explicar o que vai fazer antes de aceitar.",
      },
      {
        name: "Claude",
        role: "Raciocínio longo · ideação",
        body: "Pra quando você quer conversar sobre a ideia antes de abrir código. Cole a estrutura do repo, explique o que quer construir, peça pra desenhar a página. Depois leva o output pro Cursor e implementa.",
        tip: "Claude com extended thinking é bom pra arquitetura de página e hierarquia de conteúdo. Menos pra micro-CSS.",
      },
      {
        name: "Codex / outros agentes",
        role: "Automação · tarefas repetitivas",
        body: "Refatoração em massa, geração de variação de componente, scripts de conteúdo, migração de dado. Qualquer coisa que você faria 20 vezes à mão, tente o agente antes.",
        tip: "Teste em branch, nunca na main. Revise commit por commit antes do PR.",
      },
      {
        name: "GitHub Copilot / outros",
        role: "Autocomplete · alternativa",
        body: "Se você prefere, use. Não tem preferência de ferramenta — tem preferência de resultado. O importante é que o código que sai do seu PR seja código que você consegue defender numa revisão.",
        tip: "Combine com Cursor: agente pro grosso, autocomplete pro fino.",
      },
    ] satisfies ContribuirTool[],
  },
  conventions: {
    label: "Convenção de commits.",
    intro:
      "Escreva o commit pensando em quem vai ler o changelog semana que vem. É a única regra formal.",
    items: [
      { type: "feat", purpose: "funcionalidade ou conteúdo novo", example: "feat(roadmap): adiciona squad onboarding no 2T26" },
      { type: "fix", purpose: "correção de bug ou erro de conteúdo", example: "fix(upstream): corrige link quebrado na discovery" },
      { type: "content", purpose: "ajuste de texto sem mudança de estrutura", example: "content(downstream): reescreve abertura do handoff" },
      { type: "experiment", purpose: "exploração exploratória, pode virar ou não padrão", example: "experiment(changelog): filtro por autor com IA" },
      { type: "refactor", purpose: "reorganização sem mudança visível", example: "refactor(glasswing): separa GlasswingNav em arquivo próprio" },
      { type: "docs", purpose: "documentação do repositório", example: "docs: atualiza README com passo de instalação" },
      { type: "chore", purpose: "infra, dependências, config", example: "chore: atualiza next para 16.2.1" },
    ],
  },
  faq: {
    label: "Perguntas que aparecem toda semana.",
    items: [
      {
        question: "Minha ideia é maior do que este site. Cabe aqui?",
        answer:
          "Cabe. O laboratório é mentalidade, não ferramenta. Se a ideia é uma feature nova pro core, uma melhoria num fluxo em produção, um protótipo de produto adjacente ou uma unidade inteira nova, o convite é o mesmo — só o canal muda. Em vez de PR no repo, pode ser Figma rodando, Loom de 3 minutos, protótipo em branch separada, conversa no 🛟 #Time - Produto do Google Chat. Traz da forma que for mais concreto pra ideia conseguir andar.",
      },
      {
        question: "Posso criar uma página inteira nova?",
        answer:
          "Pode e deveria. Se você acha que falta um guia, um painel, um experimento visual aqui — cria. Copia uma página existente como ponto de partida, adapta, abre PR. O site inteiro é feito pra crescer assim.",
      },
      {
        question: "Meu experimento não precisa virar produção?",
        answer:
          "Não precisa. Vale abrir PR só pra mostrar e discutir. A branch fica registrada, a conversa acontece no PR, e se não for hora, fica parada — volta quando for. Experimento também é entrega.",
      },
      {
        question: "Posso usar qualquer biblioteca, qualquer padrão?",
        answer:
          "Sim. Se quiser adicionar Framer Motion, uma lib de gráficos, tentar um padrão de layout que nunca rolou — tenta. No PR a gente conversa sobre manter ou não. A decisão é coletiva, não de um gatekeeper.",
      },
      {
        question: "E se eu nunca usei GitHub?",
        answer:
          "Tudo bem. O Cursor tem fluxo visual de branch, commit e PR no menu lateral. Chama o Gabriel pra um pareamento de 20 minutos — é suficiente. Depois da primeira vez, nunca mais é barreira.",
      },
      {
        question: "Qual o limite de ambição por PR?",
        answer:
          "Não tem limite de ambição. Tem recomendação de escopo: PRs menores são revisados mais rápido e têm mais chance de virar merge. Se você quer mandar algo grande, manda — só não se surpreenda se a conversa for mais longa.",
      },
      {
        question: "Posso entregar código que a IA escreveu sem revisar?",
        answer:
          "Não. A IA escreve, você revisa, você defende. O PR tem seu nome — então o código é seu. Essa é a única linha dura nesta página.",
      },
    ] satisfies ContribuirFaq[],
  },
  support: {
    label: "Se travou, chame.",
    paragraphs: [
      "Qualquer bloqueio — acesso ao repo, merge conflict, build quebrada, dúvida de componente, ideia que você não sabe por onde começar — fala no Google Chat (🛟 #Time - Produto) ou abre issue no próprio repositório. A régua é: mais de 15 minutos travado, pede ajuda.",
      "E se você achar que essa página está desatualizada ou te travou em algum momento: edite ela. O arquivo é lib/data/contribuir.ts. Recursivamente, isso é o ponto.",
    ],
  },
  footer: {
    quote: "Time que experimenta junto aprende junto.",
    brand: "ZapSign · Time de Produto",
    meta: "Laboratório interno · Edição contínua",
  },
};
