export interface Opportunity {
  id: string;
  level: "Oportunidade" | "Sub-oportunidade";
  outcome: string;
  description: string;
  segment: string;
  motion: string;
  source: string;
  priority: string;
  date: string;
  evidence: string;
}

export const OPPORTUNITIES: Record<string, Opportunity> = {
  "OPP-001-0": {
    id: "OPP-001-0",
    level: "Oportunidade",
    outcome: "Conclusão de assinatura",
    description:
      "Signatários que encontram um erro durante o fluxo de assinatura não sabem como prosseguir e abandonam o processo.",
    segment: "Enterprise, SMB",
    motion: "PLG, SLG",
    source: "NPS",
    priority: "Alta",
    date: "09/03/2026",
    evidence:
      "52,5% dos detratores (42 respondentes) citam falhas no fluxo de assinatura. Fonte: analise_nps_2026-03-06.pdf",
  },
  "OPP-001-1": {
    id: "OPP-001-1",
    level: "Sub-oportunidade",
    outcome: "Conclusão de assinatura",
    description:
      "Signatários que usam o ZapSign pela primeira vez não conseguem completar o fluxo sem ajuda, por não entenderem o que fazer em cada etapa.",
    segment: "Signatários",
    motion: "PLG, SLG",
    source: "NPS",
    priority: "Média",
    date: "09/03/2026",
    evidence:
      "Autenticação avançada, selfie e conclusão do documento são os principais pontos de travamento. Signatários sem letramento digital ficam presos em erros de timeout sem conseguir resolver de forma autônoma.",
  },
  "OPP-003-1": {
    id: "OPP-003-1",
    level: "Sub-oportunidade",
    outcome: "Expansão de uso e receita",
    description:
      "Clientes que enviam para múltiplos signatários não sabem se o processo está travado ou apenas aguardando, impedindo qualquer ação antes do prazo ser perdido.",
    segment: "Enterprise, SMB",
    motion: "SLG, PLG",
    source: "NPS",
    priority: "Média",
    date: "09/03/2026",
    evidence:
      "Passivos do NPS citam falta de visibilidade e previsibilidade como fricção recorrente.",
  },
  "OPP-005-0": {
    id: "OPP-005-0",
    level: "Oportunidade",
    outcome: "Conversão enterprise",
    description:
      "Empresas com fluxos complexos não conseguem configurar múltiplos signatários com ordem definida ou etapas condicionais, sendo obrigadas a gerenciar parte do processo fora do ZapSign.",
    segment: "Enterprise",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      'Card "Fluxo de assinatura V2" levantado pelo squad upmarket (Q2).',
  },
  "OPP-006-0": {
    id: "OPP-006-0",
    level: "Oportunidade",
    outcome: "Conclusão de assinatura",
    description:
      "Documentos enviados chegam ao signatário sem identidade visual da empresa remetente, gerando dúvida sobre a legitimidade do que foi recebido.",
    segment: "Enterprise, SMB",
    motion: "PLG, SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "Domínio próprio para envio por e-mail e WhatsApp é requisito de expansão em contas de maior porte. Card levantado pelo squad upmarket (Q2).",
  },
  "OPP-007-0": {
    id: "OPP-007-0",
    level: "Oportunidade",
    outcome: "Conclusão de assinatura",
    description:
      "Signatários que recebem documentos via WhatsApp abandonam o processo ao serem redirecionados para fora do aplicativo.",
    segment: "Enterprise, SMB",
    motion: "PLG, SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "11,2% dos detratores citam WhatsApp/envio como fricção. Fonte: analise_nps_2026-03-06.pdf",
  },
  "OPP-008-0": {
    id: "OPP-008-0",
    level: "Oportunidade",
    outcome: "Conversão free-to-paid",
    description:
      "Clientes free que chegam a uma funcionalidade paga não entendem que precisam fazer upgrade para acessá-la, gerando frustração e abandono sem conversão.",
    segment: "Free users",
    motion: "PLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      'Card "Paywall funcionalidades por plano" levantado pelo squad growth (Q2).',
  },
  "OPP-009-0": {
    id: "OPP-009-0",
    level: "Oportunidade",
    outcome: "Conversão free-to-paid",
    description:
      "Clientes que decidem fazer upgrade não conseguem concluir a compra de forma fluida, gerando abandono no momento de maior intenção de pagamento.",
    segment: "Free users",
    motion: "PLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "No mobile, a distinção entre mensal e anual não está clara na seleção do plano. Fonte: Luciane, 14/03/2026.",
  },
  "OPP-009-1": {
    id: "OPP-009-1",
    level: "Sub-oportunidade",
    outcome: "Conversão free-to-paid",
    description:
      "Clientes fora do Brasil não conseguem identificar qual plano faz sentido para o seu contexto porque a estrutura de planos foi desenhada para o mercado brasileiro.",
    segment: "LATAM (ex-Brasil)",
    motion: "PLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      'Card "Estructura de planes LATAM" levantado como prioridade pelo squad growth.',
  },
  "OPP-011-0": {
    id: "OPP-011-0",
    level: "Oportunidade",
    outcome: "Retenção e satisfação",
    description:
      "Clientes com alto volume de envios não conseguem reutilizar templates de forma eficiente, sendo obrigados a reconfigurar manualmente partes do documento a cada envio.",
    segment: "Enterprise",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "DocuSign e D4Sign exibem prévia do documento em tempo real durante o preenchimento do modelo dinâmico; ZapSign só exibe após conclusão. Fonte: Vinicius, 17/03/2026.",
  },
  "OPP-012-0": {
    id: "OPP-012-0",
    level: "Oportunidade",
    outcome: "Conversão enterprise",
    description:
      "Clientes que precisam coletar dados via formulário antes da assinatura não conseguem cobrir seus casos de uso com a funcionalidade atual, que tem gaps e apresenta bugs.",
    segment: "Enterprise",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "No modelo dinâmico, apenas um participante pode preencher antes de assinar; clientes com fluxos multi-parte ficam bloqueados. Fonte: Vinicius, 17/03/2026.",
  },
  "OPP-013-0": {
    id: "OPP-013-0",
    level: "Oportunidade",
    outcome: "Conversão enterprise",
    description:
      "Clientes enterprise que precisam criar documentos complexos recorrem a ferramentas externas porque a ferramenta de criação atual não cobre seus casos de uso.",
    segment: "Enterprise",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "ZapSign percebida como menos madura que concorrentes nessa etapa.",
  },
  "OPP-014-0": {
    id: "OPP-014-0",
    level: "Oportunidade",
    outcome: "Retenção e satisfação",
    description:
      "Clientes com alto volume de documentos têm dificuldade em organizar, filtrar e localizar documentos na listagem atual, aumentando o tempo gasto em tarefas operacionais básicas.",
    segment: "Enterprise",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      'Card "Listar documentos V2" levantado pelo squad retenção (Q2).',
  },
  "OPP-015-0": {
    id: "OPP-015-0",
    level: "Oportunidade",
    outcome: "Expansão de uso e receita",
    description:
      "Clientes que precisam enviar arquivos em outros formatos além de PDF são bloqueados pela plataforma antes mesmo de iniciar o fluxo de assinatura.",
    segment: "Enterprise, SMB",
    motion: "PLG, SLG",
    source: "Observação",
    priority: "Média",
    date: "10/03/2026",
    evidence:
      'Card "Permitir mais formatos de documentos" (squad retenção).',
  },
  "OPP-016-0": {
    id: "OPP-016-0",
    level: "Oportunidade",
    outcome: "Retenção e satisfação",
    description:
      "Clientes que precisam atualizar o método de pagamento ou dados da nota fiscal não conseguem fazer isso de forma autônoma, gerando dependência do suporte para uma tarefa administrativa básica.",
    segment: "SMB",
    motion: "PLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      'Card "Permitir alterar método de pagamento" (squad retenção).',
  },
  "OPP-017-0": {
    id: "OPP-017-0",
    level: "Oportunidade",
    outcome: "Retenção e satisfação",
    description:
      "Clientes que pagam via boleto geram inadimplência recorrente e sobrecarga no suporte, criando fricção que aumenta o risco de cancelamento.",
    segment: "SMB",
    motion: "PLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "Boleto é o principal gerador de tickets de suporte. Clientes no plano mensal não têm PIX como opção. Fonte: Luciane, 14/03/2026.",
  },
  "OPP-020-0": {
    id: "OPP-020-0",
    level: "Oportunidade",
    outcome: "Retenção e satisfação",
    description:
      "Clientes enterprise não conseguem extrair os dados que precisam nos relatórios atuais, limitando a visibilidade sobre seus processos de assinatura e a tomada de decisão.",
    segment: "Enterprise",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "Relatórios atuais têm gaps de dados e usabilidade que não atendem operações complexas.",
  },
  "OPP-021-0": {
    id: "OPP-021-0",
    level: "Oportunidade",
    outcome: "Expansão LATAM",
    description:
      "Clientes em mercados LATAM com legislação específica não conseguem usar o ZapSign em processos que exigem validade jurídica local porque a plataforma não suporta os certificados digitais de cada país.",
    segment: "LATAM (ex-Brasil)",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence: "",
  },
  "OPP-021-1": {
    id: "OPP-021-1",
    level: "Sub-oportunidade",
    outcome: "Expansão LATAM",
    description:
      "Clientes no Chile não conseguem usar o ZapSign em processos que exigem validade jurídica porque a plataforma não suporta assinatura com certificado digital local.",
    segment: "Chile",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      'Card "Chile: assinatura com certificado digital" levantado como integração prioritária para expansão LATAM.',
  },
  "OPP-021-2": {
    id: "OPP-021-2",
    level: "Sub-oportunidade",
    outcome: "Expansão LATAM",
    description:
      "Clientes no México não conseguem usar o ZapSign em processos que exigem validade jurídica plena porque a plataforma não suporta assinatura com e.firma.",
    segment: "México",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "Ausência de suporte a e.firma é bloqueador de adoção em processos com requisito legal no México.",
  },
  "OPP-021-3": {
    id: "OPP-021-3",
    level: "Sub-oportunidade",
    outcome: "Expansão LATAM",
    description:
      "Clientes no México que precisam comprovar a data e hora exata de uma assinatura não conseguem fazer isso pelo ZapSign porque a plataforma não emite carimbo de tempo com validade jurídica local.",
    segment: "México",
    motion: "SLG",
    source: "Observação",
    priority: "Alta",
    date: "10/03/2026",
    evidence:
      "Requisito jurídico específico do mercado mexicano para documentos que exigem comprovação temporal.",
  },
  "OPP-026-0": {
    id: "OPP-026-0",
    level: "Oportunidade",
    outcome: "Expansão de uso e receita",
    description:
      "Clientes em planos intermediários não têm incentivo claro para migrar para o plano superior porque não percebem o valor adicional que ganhariam com o upgrade.",
    segment: "SMB",
    motion: "PLG",
    source: "Observação",
    priority: "Média",
    date: "11/03/2026",
    evidence: "",
  },
  "OPP-026-1": {
    id: "OPP-026-1",
    level: "Sub-oportunidade",
    outcome: "Expansão de uso e receita",
    description:
      "Clientes no plano Profissional não enxergam motivo suficiente para migrar para o Equipe Plus.",
    segment: "SMB",
    motion: "PLG",
    source: "Observação",
    priority: "Média",
    date: "11/03/2026",
    evidence: "",
  },
  "OPP-026-2": {
    id: "OPP-026-2",
    level: "Sub-oportunidade",
    outcome: "Expansão de uso e receita",
    description:
      "Clientes no plano Equipe não enxergam motivo suficiente para migrar para o Equipe Plus.",
    segment: "SMB",
    motion: "PLG",
    source: "Observação",
    priority: "Média",
    date: "11/03/2026",
    evidence: "",
  },
  "OPP-029-1": {
    id: "OPP-029-1",
    level: "Oportunidade",
    outcome: "Conclusão de assinatura",
    description:
      "Signatários e clientes que dependem de um código de autenticação para avançar não recebem o token, sendo bloqueados no meio do fluxo sem conseguir resolver de forma autônoma.",
    segment: "SMB, Enterprise",
    motion: "PLG, SLG",
    source: "Suporte",
    priority: "Alta",
    date: "16/03/2026",
    evidence:
      "Falha afeta fluxo de assinatura (OTP) e acesso à plataforma (login). SMS sem rastreabilidade. WhatsApp com falha de geração de token desde 14/03/2026. Terceira maior categoria de reclamações no Reclame Aqui.",
  },
  "OPP-032-0": {
    id: "OPP-032-0",
    level: "Oportunidade",
    outcome: "Expansão de uso e receita",
    description:
      "Clientes que fazem upgrade de plano descobrem tardiamente que determinadas funcionalidades exigem créditos adicionais, gerando frustração e tickets de suporte evitáveis.",
    segment: "SMB",
    motion: "PLG",
    source: "Entrevista",
    priority: "Média",
    date: "12/03/2026",
    evidence:
      "Caso recorrente: cliente faz upgrade esperando acesso à consulta de antecedentes, mas a funcionalidade exige crédito separado. Fonte: Ana Borzaga, 12/03/2026.",
  },
  "OPP-036-0": {
    id: "OPP-036-0",
    level: "Oportunidade",
    outcome: "Conclusão de assinatura",
    description:
      "Clientes que enviam documentos com dados pré-preenchidos via modelo recebem o arquivo final em branco após a assinatura, porque o formulário sobrepõe e apaga os campos preenchidos.",
    segment: "Enterprise, SMB",
    motion: "PLG, SLG",
    source: "Suporte",
    priority: "Alta",
    date: "16/03/2026",
    evidence:
      "Caso ativo: Pronto Saúde Digital, 10 documentos afetados, R$8k MRR em risco (ticket Z-SUP-1854). Fonte: Luciane, 14/03/2026.",
  },
  "OPP-041-0": {
    id: "OPP-041-0",
    level: "Oportunidade",
    outcome: "Conversão enterprise",
    description:
      "Clientes que enviam contratos com prazo de vigência definido não conseguem monitorar vencimentos nem configurar alertas dentro da plataforma.",
    segment: "Enterprise, SMB",
    motion: "SLG, PLG",
    source: "Entrevista",
    priority: "Alta",
    date: "17/03/2026",
    evidence:
      "Deal-blocker direto: perda de R$1.126 MRR. DocuSign, ClickSign e D4Sign têm nativamente. Fonte: Vinicius, 17/03/2026.",
  },
};
