"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./ScaleList.module.css";

interface ScaleItem {
  size: "sm" | "md" | "lg";
  label: string;
  artifact?: string;
  description: string;
}

interface ScaleListProps {
  items: ScaleItem[];
}

const SIZE_LABELS: Record<string, string> = {
  sm: "Pequeno",
  md: "Médio",
  lg: "Grande",
};

interface ModalTemplate {
  badge: string;
  badgeStyle: string;
  title: string;
  content: string;
}

const MODAL_TEMPLATES: Record<string, ModalTemplate> = {
  sm: {
    badge: "Pequeno",
    badgeStyle: styles.modalBadgeSm,
    title: "Task",
    content: `
<p class="${styles.intro}">Para iniciativas que cabem em menos de 1 sprint. O objetivo é dar contexto suficiente para o time executar sem ambiguidade — sem overhead de documento.</p>

<h3>Título</h3>
<p>Nome curto e descritivo. Quem lê o título deve entender o que vai ser feito.<br/>
<em>Ex: "Adicionar feedback visual no upload de documento"</em></p>

<h3>Contexto</h3>
<p>Por que essa tarefa é relevante agora? Qual problema ou oportunidade a originou? Duas ou três frases bastam.</p>

<h3>Hipótese</h3>
<p>Se fizermos <strong>[ação]</strong>, esperamos que <strong>[resultado para o usuário]</strong>, o que gera <strong>[resultado para o negócio]</strong>.</p>

<h3>Critério de aceite</h3>
<p>Lista objetiva de condições que precisam ser verdadeiras para a task ser considerada completa. Seja específico — quem vai testar precisa saber exatamente o que verificar.</p>
<p><em>Ex: Barra de progresso aparece durante upload; mensagem de erro exibida se arquivo excede 10 MB.</em></p>

<h3>Fora de escopo</h3>
<p>O que essa task deliberadamente não resolve.<br/>
<em>Ex: Suporte a formatos além de PDF e DOCX.</em></p>

<hr/>
<p class="${styles.tip}">Formato recomendado: card no board do time (Linear, Jira, Notion). Não precisa de documento separado.</p>
`,
  },
  md: {
    badge: "Médio",
    badgeStyle: styles.modalBadgeMd,
    title: "One-Pager",
    content: `
<p class="${styles.intro}">Para iniciativas de 1 a 3 sprints. Força concisão enquanto exige mais rigor que uma task — contexto, cenários e critério de sucesso em um único documento objetivo.</p>

<h3>Título e resumo</h3>
<p>Nome da iniciativa + uma frase que descreve o que será feito e por quê. Quem lê o resumo deve decidir se precisa ler o resto.</p>

<h3>Contexto</h3>
<p>O que está acontecendo que torna essa iniciativa relevante agora? Inclua dados, evidências ou sinais que sustentam a decisão. Três a cinco frases.</p>

<h3>Problema ou oportunidade</h3>
<p>Qual é o problema do usuário ou a oportunidade de negócio? Para quem? Qual é a frequência e o impacto?</p>

<h3>Hipótese</h3>
<p>Se fizermos <strong>[ação]</strong>, esperamos que <strong>[resultado para o usuário]</strong>, o que gera <strong>[resultado para o negócio]</strong>.</p>

<h3>Cenários principais</h3>
<p>Descreva os 3 a 5 cenários que cobrem a maioria dos casos de uso. Para cada um: gatilho, fluxo esperado e resultado. Inclua o caminho feliz e os principais caminhos alternativos.</p>

<h3>Critério de sucesso</h3>
<p>Métrica principal, métrica de proteção e sinal de curto prazo. Inclua a linha de base atual e o resultado esperado.</p>

<h3>Fora de escopo</h3>
<p>O que essa iniciativa deliberadamente não resolve — e por quê.</p>

<h3>Riscos e dependências</h3>
<p>O que pode impedir ou atrasar a entrega? Há dependência de outro time, serviço externo ou decisão pendente?</p>

<hr/>
<p class="${styles.tip}">Formato recomendado: documento de uma página (Notion, Google Docs). Se está passando de uma página, considere escalar para um DCP.</p>
`,
  },
  lg: {
    badge: "Grande",
    badgeStyle: styles.modalBadgeLg,
    title: "DCP",
    content: `
<p class="${styles.intro}">Documento de Concepção de Produto — para iniciativas acima de 1 trimestre. Registra pesquisa, análise e decisões de concepção. Serve como referência para todo o ciclo de vida da iniciativa.</p>

<h3>Resumo executivo</h3>
<p>O que será feito, por que agora e qual o resultado esperado. Qualquer pessoa deve entender a iniciativa lendo apenas este bloco. Máximo cinco frases.</p>

<h3>Contexto e evidências</h3>
<p>Dados quantitativos e qualitativos que sustentam a iniciativa. Métricas atuais, pesquisas, feedback de usuários, análise competitiva e tendências relevantes.</p>

<h3>Árvore de oportunidades</h3>
<p>Mapeamento estruturado: resultado desejado → oportunidades identificadas → soluções possíveis. Deixe explícito o caminho da escolha e por que as alternativas foram descartadas.</p>

<h3>Hipóteses e métricas</h3>
<p>Para cada hipótese central: o que acreditamos, como vamos testar e qual métrica indica sucesso ou falha. Inclua linha de base e meta.</p>

<h3>Análise de viabilidade</h3>
<p>Viabilidade técnica, de negócio e de design. Restrições conhecidas, capacidade necessária e trade-offs identificados.</p>

<h3>Cenários e trade-offs</h3>
<p>Cenários detalhados de uso — feliz, alternativo e extremo. Para cada trade-off relevante: opções consideradas, critério de decisão e escolha feita.</p>

<h3>Plano de validação</h3>
<p>Como a solução será validada antes do build completo. Protótipos, testes com usuários, pilotos ou experimentos planejados.</p>

<h3>Critério de sucesso</h3>
<p>Métricas de resultado, não de output. Métrica principal, métrica de proteção, sinais de curto e longo prazo, e prazo esperado para avaliação.</p>

<h3>Riscos e dependências</h3>
<p>Riscos técnicos, de negócio e de adoção. Dependências internas e externas. Para cada risco: probabilidade, impacto e mitigação proposta.</p>

<h3>Fora de escopo</h3>
<p>O que essa iniciativa deliberadamente não resolve, por que foi excluído e onde isso será tratado (se aplicável).</p>

<hr/>
<p class="${styles.tip}">Formato recomendado: documento estruturado (Notion, Google Docs) com seções navegáveis. Espera-se revisão com stakeholders antes de avançar para design.</p>
`,
  },
};

function TemplateModal({
  template,
  onClose,
}: {
  template: ModalTemplate;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className={`${styles.overlay} ${styles.overlayOpen}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <span className={`${styles.modalBadge} ${template.badgeStyle}`}>
              {template.badge}
            </span>
            <span className={styles.modalTitle}>{template.title}</span>
          </div>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        <div
          className={styles.modalBody}
          dangerouslySetInnerHTML={{ __html: template.content }}
        />
      </div>
    </div>,
    document.body
  );
}

export function ScaleList({ items }: ScaleListProps) {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const handleClose = useCallback(() => setOpenModal(null), []);

  return (
    <>
      <div className={styles.list}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.itemLeft}>
              <span className={`${styles.badge} ${styles[item.size]}`}>
                {SIZE_LABELS[item.size]}
              </span>
              <span>{item.description}</span>
            </div>
            {MODAL_TEMPLATES[item.size] && (
              <button
                className={styles.templateBtn}
                onClick={() => setOpenModal(item.size)}
              >
                Ver template
              </button>
            )}
          </div>
        ))}
      </div>

      {openModal && MODAL_TEMPLATES[openModal] && (
        <TemplateModal
          template={MODAL_TEMPLATES[openModal]}
          onClose={handleClose}
        />
      )}
    </>
  );
}
