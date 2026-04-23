import { managementTipsData as data } from "@/lib/data/management-tips";
import { Comments } from "@/components/comments/Comments";
import { loadCommentsStore } from "@/lib/data/comments-store";
import { getPageThreads } from "@/lib/data/comments";
import { GuideHeader } from "@/components/guide/GuideHeader";
import { SectionLabel } from "@/components/guide/SectionLabel";
import { PrincipleCard } from "@/components/guide/PrincipleCard";
import { FrameworkCards } from "@/components/guide/FrameworkCards";
import { PhaseBlock } from "@/components/guide/PhaseBlock";
import { StepCard } from "@/components/guide/StepCard";
import { TemplateBox } from "@/components/guide/TemplateBox";
import { CardColumns } from "@/components/guide/CardColumns";
import { MetricRow } from "@/components/guide/MetricRow";
import { StepNote } from "@/components/guide/StepNote";
import { FidelityLadder } from "@/components/guide/FidelityLadder";
import { Bridge } from "@/components/guide/Bridge";
import { IterationStrip } from "@/components/guide/IterationStrip";
import { Deliverables } from "@/components/guide/Deliverables";
import { GuideFooter } from "@/components/guide/GuideFooter";
import styles from "./management-tips.module.css";

const PAGE_ID = "/dashboard/management-tips";

export default async function ManagementTipsPage() {
  const threads = getPageThreads(await loadCommentsStore(), PAGE_ID);
  return (
    <Comments pageId={PAGE_ID} initialThreads={threads}>
    <div className={styles.page} data-comment-block="management-tips.page">
      <GuideHeader {...data.header} />

      <SectionLabel>Princípios</SectionLabel>
      <div className={styles.principlesGrid}>
        {data.principles.map((p, i) => (
          <div key={i} className={`animate-fade-up stagger-${i + 1}`}>
            <PrincipleCard {...p} />
          </div>
        ))}
      </div>

      <SectionLabel>Quando aplicar</SectionLabel>
      <div className={styles.startingGrid}>
        <FrameworkCards cards={data.startingPoints} />
      </div>

      {/* Fase 01 — Comunicar com Impacto */}
      <PhaseBlock
        phase="Fase 01"
        color="blue"
        title="Comunicar com Impacto"
        subtitle="Empatia · Estrutura · Ação"
      />

      <StepCard {...data.step1}>
        <TemplateBox {...data.step1.template} />
        <CardColumns columns={data.step1.columns} />
      </StepCard>

      <StepCard {...data.step2} isLast>
        <MetricRow metrics={data.step2.metrics} />
        <CardColumns columns={data.step2.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step2.note }} />
        </StepNote>
      </StepCard>

      <Bridge label={data.bridge1.label}>
        <span dangerouslySetInnerHTML={{ __html: data.bridge1.html }} />
      </Bridge>

      {/* Fase 02 — Construir Resiliência no Time */}
      <PhaseBlock
        phase="Fase 02"
        color="amber"
        title="Construir Resiliência no Time"
        subtitle="Consciência · Segurança · Confiança"
      />

      <StepCard {...data.step3}>
        <TemplateBox {...data.step3.template} />
        <CardColumns columns={data.step3.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step3.note }} />
        </StepNote>
      </StepCard>

      <StepCard {...data.step4} isLast>
        <CardColumns columns={data.step4.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step4.note }} />
        </StepNote>
      </StepCard>

      <IterationStrip {...data.iteration} />

      <Bridge label={data.bridge2.label}>
        <span dangerouslySetInnerHTML={{ __html: data.bridge2.html }} />
      </Bridge>

      {/* Fase 03 — Desenvolver Hábitos de Gestão */}
      <PhaseBlock
        phase="Fase 03"
        color="green"
        title="Desenvolver Hábitos de Gestão"
        subtitle="Gatilho · Rotina · Recompensa"
      />

      <StepCard {...data.step5}>
        <FidelityLadder steps={data.step5.fidelity} />
        <CardColumns columns={data.step5.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step5.note }} />
        </StepNote>
      </StepCard>

      <StepCard {...data.step6} isLast>
        <MetricRow metrics={data.step6.metrics} />
        <CardColumns columns={data.step6.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step6.note }} />
        </StepNote>
      </StepCard>

      <Deliverables {...data.deliverables} />
      <GuideFooter {...data.footer} />
    </div>
    </Comments>
  );
}
