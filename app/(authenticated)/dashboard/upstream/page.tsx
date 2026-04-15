import { upstreamData as data } from "@/lib/data/upstream";
import { GuideHeader } from "@/components/guide/GuideHeader";
import { SectionLabel } from "@/components/guide/SectionLabel";
import { PrincipleCard } from "@/components/guide/PrincipleCard";
import { StartingPointCard } from "@/components/guide/StartingPointCard";
import { PhaseBlock } from "@/components/guide/PhaseBlock";
import { StepCard } from "@/components/guide/StepCard";
import { TemplateBox } from "@/components/guide/TemplateBox";
import { CardColumns } from "@/components/guide/CardColumns";
import { MetricRow } from "@/components/guide/MetricRow";
import { StepNote } from "@/components/guide/StepNote";
import { ScaleList } from "@/components/guide/ScaleList";
import { FidelityLadder } from "@/components/guide/FidelityLadder";
import { Bridge } from "@/components/guide/Bridge";
import { IterationStrip } from "@/components/guide/IterationStrip";
import { Deliverables } from "@/components/guide/Deliverables";
import { NextSteps } from "@/components/guide/NextSteps";
import { GuideFooter } from "@/components/guide/GuideFooter";
import styles from "./upstream.module.css";

export default function UpstreamGuidePage() {
  return (
    <div className={styles.page}>
      <GuideHeader {...data.header} />

      {/* Principios */}
      <SectionLabel>Princípios</SectionLabel>
      <div className={styles.principlesGrid}>
        {data.principles.map((p, i) => (
          <div key={i} className={`animate-fade-up stagger-${i + 1}`}>
            <PrincipleCard {...p} />
          </div>
        ))}
      </div>

      {/* Pontos de partida */}
      <SectionLabel>Pontos de partida possíveis</SectionLabel>
      <div className={styles.startingGrid}>
        {data.startingPoints.map((sp, i) => (
          <div key={i} className={`animate-fade-up stagger-${i + 1}`}>
            <StartingPointCard {...sp} />
          </div>
        ))}
      </div>

      {/* Fase 01 */}
      <PhaseBlock
        phase="Fase 01"
        color="blue"
        title="Entendimento do Ponto de Partida"
        subtitle="Contextualizar · Medir · Alinhar"
      />

      <StepCard {...data.step1}>
        <TemplateBox {...data.step1.template} />
        <CardColumns columns={data.step1.columns} />
      </StepCard>

      <StepCard {...data.step2}>
        <MetricRow metrics={data.step2.metrics} />
        <CardColumns columns={data.step2.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step2.note }} />
        </StepNote>
      </StepCard>

      <StepCard {...data.step3} isLast>
        <div className={styles.scaleWrapper}>
          <span className={styles.scaleLabel}>Escala de profundidade do documento</span>
          <ScaleList items={data.step3.scale} />
        </div>
        <CardColumns columns={data.step3.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step3.note }} />
        </StepNote>
      </StepCard>

      <Bridge label={data.bridge1.label}>
        <span dangerouslySetInnerHTML={{ __html: data.bridge1.html }} />
      </Bridge>

      {/* Fase 02 */}
      <PhaseBlock
        phase="Fase 02"
        color="amber"
        title="Design e Validação"
        subtitle="Explorar · Prototipar · Testar"
      />

      <StepCard {...data.step4}>
        <FidelityLadder steps={data.step4.fidelity} />
        <CardColumns columns={data.step4.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step4.note }} />
        </StepNote>
      </StepCard>

      <StepCard {...data.step5} isLast>
        <CardColumns columns={data.step5.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step5.note }} />
        </StepNote>
      </StepCard>

      <IterationStrip {...data.iteration} />

      <Bridge label={data.bridge2.label}>
        <span dangerouslySetInnerHTML={{ __html: data.bridge2.html }} />
      </Bridge>

      {/* Fase 03 */}
      <PhaseBlock
        phase="Fase 03"
        color="green"
        title="Entrega com Qualidade"
        subtitle="Especificar · Negociar · Lançar"
      />

      <StepCard {...data.step6} isLast>
        <CardColumns columns={data.step6.columns} />
        <StepNote>
          <span dangerouslySetInnerHTML={{ __html: data.step6.note }} />
        </StepNote>
      </StepCard>

      <Deliverables {...data.deliverables} />
      <NextSteps {...data.nextSteps} />
      <GuideFooter {...data.footer} />
    </div>
  );
}
