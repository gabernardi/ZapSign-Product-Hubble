"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./FrameworkCards.module.css";

type FrameworkId = "open-narrow-close" | "escuta-avec" | "apr" | "reach";
type CardColor = "blue" | "amber" | "teal" | "purple";

interface FrameworkCard {
  id: FrameworkId;
  color: CardColor;
  title: string;
  body: string;
  focusLabel: string;
  focusValue: string;
}

interface FrameworkCardsProps {
  cards: FrameworkCard[];
}

/* ─── Modal visual data ─── */

interface FrameworkStep {
  letter: string;
  title: string;
  description: string;
  example?: string;
}

interface FrameworkModalData {
  id: FrameworkId;
  color: CardColor;
  badge: string;
  title: string;
  subtitle: string;
  steps: FrameworkStep[];
  tip: string;
}

const FRAMEWORK_MODALS: FrameworkModalData[] = [
  {
    id: "open-narrow-close",
    color: "blue",
    badge: "Facilitação",
    title: "Abrir, Afunilar, Fechar",
    subtitle:
      "Três movimentos que transformam qualquer reunião. Funciona para alinhamentos de 15 minutos ou sessões de uma hora.",
    steps: [
      {
        letter: "A",
        title: "Abra com contexto",
        description:
          "Deixe claro por que estão ali e quanto tempo têm. Quando todos entendem o propósito, a conversa já começa no trilho.",
        example:
          '"Estamos aqui para decidir X. Temos 30 minutos. Quero ouvir cada um antes de fechar."',
      },
      {
        letter: "F",
        title: "Afunile com perguntas",
        description:
          "Guie a conversa com perguntas que mantêm o foco. Garanta que todos falem, não só os mais vocais.",
        example:
          '"Quais são os 2 caminhos mais viáveis? O que falta saber para decidir?"',
      },
      {
        letter: "F",
        title: "Feche com ação",
        description:
          "Sintetize o que foi decidido, defina quem faz o quê e até quando. Nenhuma reunião termina sem isso.",
        example:
          '"Decidimos seguir com Y. João entrega até sexta. Maria valida com engenharia na segunda."',
      },
    ],
    tip: "Se você sai da reunião sem saber quem faz o quê até quando, a reunião não teve fechamento.",
  },
  {
    id: "escuta-avec",
    color: "amber",
    badge: "Relacionamentos",
    title: "Escuta Ativa + AVEC",
    subtitle:
      "Quatro qualidades que constroem confiança em qualquer relação profissional. Tudo começa por ouvir de verdade.",
    steps: [
      {
        letter: "A",
        title: "Atenção",
        description:
          "Escute sem julgamento e sem planejar o que vai dizer. Esteja ali por inteiro.",
        example:
          "Feche o notebook. Silencie as notificações. Faça contato visual.",
      },
      {
        letter: "V",
        title: "Vulnerabilidade",
        description:
          "Reconheça o que errou e o que não sabe. Autenticidade cria conexão mais rápido que qualquer técnica.",
        example:
          '"Errei ao assumir que você já sabia do contexto. Deveria ter alinhado antes."',
      },
      {
        letter: "E",
        title: "Empatia",
        description:
          "Tente entender o que o outro sente a partir do que ele conta. Não do que você acha que ele deveria sentir.",
        example:
          '"Imagino que isso tenha sido frustrante. Como posso ajudar?"',
      },
      {
        letter: "C",
        title: "Compaixão",
        description:
          "Pergunte como a pessoa está de verdade. E invista tempo na resposta, não só no check-in rápido.",
        example:
          '"Vi que a semana foi puxada. Como você está? O que posso tirar do seu prato?"',
      },
    ],
    tip: "Escutar de verdade não é esperar sua vez de falar. É dar espaço para o outro pensar em voz alta.",
  },
  {
    id: "apr",
    color: "teal",
    badge: "Resiliência",
    title: "Técnica APR",
    subtitle:
      "Perceber, Pausar, Reenquadrar. Três passos para sair do piloto automático e escolher como responder.",
    steps: [
      {
        letter: "A",
        title: "Perceber",
        description:
          "Note que entrou no automático. O que está sentindo? Que história está contando para si mesmo sobre a situação?",
        example:
          '"Estou irritado com essa mudança de prioridade. Minha narrativa agora é: isso é injusto."',
      },
      {
        letter: "P",
        title: "Pausar",
        description:
          "Crie um espaço entre o que aconteceu e o que você vai fazer. Respire fundo. Não reaja ainda.",
        example:
          "Antes de responder aquele Slack, conte até 10. A pausa muda o tom de tudo.",
      },
      {
        letter: "R",
        title: "Reenquadrar",
        description:
          "Olhe por outro ângulo. Faça a si mesmo uma pergunta que abra possibilidades em vez de fechar.",
        example:
          '"E se essa mudança de prioridade for uma chance de mostrar adaptabilidade?"',
      },
    ],
    tip: "Funciona em tempo real (10 segundos antes de reagir) e como reflexão no fim do dia.",
  },
  {
    id: "reach",
    color: "purple",
    badge: "Segurança Psicológica",
    title: "Modelo REACH",
    subtitle:
      "Um ambiente onde as pessoas falam o que pensam, erram sem medo e crescem juntas. Quatro ações para chegar lá.",
    steps: [
      {
        letter: "R",
        title: "Ressignifique erros",
        description:
          "Errar faz parte. O que importa é aprender rápido. Trate o erro como informação, não como fracasso.",
        example:
          '"Esse problema nos ensinou X. O que mudamos para que não se repita?"',
      },
      {
        letter: "E",
        title: "Encoraje todas as vozes",
        description:
          "Peça a opinião de quem está quieto. As melhores ideias muitas vezes estão com quem não costuma falar primeiro.",
        example:
          '"Ana, você tem uma perspectiva diferente. O que está pensando?"',
      },
      {
        letter: "A",
        title: "Valorize contribuições",
        description:
          "Reconhecimento específico vale mais que elogio genérico. Diga exatamente o que a pessoa fez bem e por que fez diferença.",
        example:
          '"A forma como você organizou aquele documento facilitou a decisão de todo o time."',
      },
      {
        letter: "C",
        title: "Desenvolva os outros",
        description:
          "Não entregue a resposta pronta. Ajude a pessoa a encontrar sozinha. Boas perguntas desenvolvem mais que bons conselhos.",
        example:
          '"O que você faria diferente se pudesse tomar essa decisão de novo?"',
      },
    ],
    tip: "Se ninguém discordou de você essa semana, vale se perguntar se o ambiente está seguro o suficiente para isso.",
  },
];

const MODAL_MAP = Object.fromEntries(
  FRAMEWORK_MODALS.map((m) => [m.id, m])
) as Record<FrameworkId, FrameworkModalData>;

const COLOR_CLASSES: Record<CardColor, string> = {
  blue: styles.colorBlue,
  amber: styles.colorAmber,
  teal: styles.colorTeal,
  purple: styles.colorPurple,
};

/* ─── Modal Component ─── */

function FrameworkModal({
  data,
  onClose,
}: {
  data: FrameworkModalData;
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

  const colorClass = COLOR_CLASSES[data.color];

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
            <span className={`${styles.modalBadge} ${colorClass}`}>
              {data.badge}
            </span>
            <span className={styles.modalTitle}>{data.title}</span>
          </div>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalSubtitle}>{data.subtitle}</p>

          <div className={styles.stepsContainer}>
            {data.steps.map((step, i) => (
              <div key={i} className={styles.stepRow}>
                <div className={`${styles.stepCircle} ${colorClass}`}>
                  {step.letter}
                </div>
                {i < data.steps.length - 1 && (
                  <div className={styles.stepLine} />
                )}
                <div className={styles.stepContent}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDesc}>{step.description}</div>
                  {step.example && (
                    <div className={`${styles.stepExample} ${colorClass}`}>
                      {step.example}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles.tipBox} ${colorClass}`}>
            <span className={styles.tipLabel}>Na prática</span>
            <span className={styles.tipText}>{data.tip}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Cards Component ─── */

export function FrameworkCards({ cards }: FrameworkCardsProps) {
  const [openModal, setOpenModal] = useState<FrameworkId | null>(null);
  const handleClose = useCallback(() => setOpenModal(null), []);

  return (
    <>
      {cards.map((card, i) => (
        <div key={i} className={`animate-fade-up stagger-${i + 1}`}>
          <div className={styles.card}>
            <div className={`${styles.dot} ${styles[card.color]}`} />
            <div className={styles.cardTitle}>{card.title}</div>
            <div className={styles.cardBody}>{card.body}</div>
            <button
              className={`${styles.cardLink} ${COLOR_CLASSES[card.color]}`}
              onClick={() => setOpenModal(card.id)}
            >
              <span>{card.focusValue}</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {openModal && MODAL_MAP[openModal] && (
        <FrameworkModal data={MODAL_MAP[openModal]} onClose={handleClose} />
      )}
    </>
  );
}
