import styles from "./PlatformProgress.module.css";
import type { ProjectStatus } from "@/lib/data/roadmap";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  development: "Em desenvolvimento",
  design: "Design",
  discovery: "Discovery",
  blocked: "Bloqueado",
  validated: "Validado",
  conditional: "Condicional",
  production: "Em produção",
  backlog: "Backlog",
};

interface PlatformFlow {
  id: string;
  name: string;
  squadName: string;
  progress: number;
  status: ProjectStatus;
}

interface PlatformProgressProps {
  flows: PlatformFlow[];
}

export function PlatformProgress({ flows }: PlatformProgressProps) {
  return (
    <ul className={styles.list} aria-label="Progresso dos fluxos da Plataforma v2">
      {flows.map((flow) => (
        <li key={flow.id} className={styles.row}>
          <div className={styles.head}>
            <div className={styles.identity}>
              <h4 className={styles.name}>{flow.name}</h4>
              <span className={styles.squad}>{flow.squadName}</span>
            </div>
            <div className={styles.meta}>
              <span
                className={`${styles.status} ${styles[`status_${flow.status}`]}`}
              >
                {STATUS_LABEL[flow.status]}
              </span>
              <span className={styles.percent}>{flow.progress}%</span>
            </div>
          </div>

          <div className={styles.track} aria-hidden="true">
            <div
              className={`${styles.fill} ${flow.status === "production" ? styles.fillComplete : ""}`}
              style={{ width: `${Math.max(0, Math.min(100, flow.progress))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
