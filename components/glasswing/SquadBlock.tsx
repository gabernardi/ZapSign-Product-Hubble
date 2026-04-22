import styles from "./SquadBlock.module.css";
import type { ProjectStatus, RoadmapGoal, RoadmapProject } from "@/lib/data/roadmap";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  development: "Em desenvolvimento",
  design: "Design",
  discovery: "Discovery",
  validated: "Validado",
  conditional: "Condicional",
  production: "Em produção",
  backlog: "Backlog",
};

interface SquadBlockProps {
  id?: string;
  number: string;
  name: string;
  context: string;
  people: {
    pm: string;
    tl: string;
    devs: string[];
  };
  goals: RoadmapGoal[];
  projects: RoadmapProject[];
}

export function SquadBlock({
  id,
  number,
  name,
  context,
  people,
  goals,
  projects,
}: SquadBlockProps) {
  return (
    <article id={id} className={styles.squad}>
      <div className={styles.number}>{number}</div>
      <div className={styles.body}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>Squad</span>
          <h3 className={styles.name}>{name}</h3>
        </header>

        <p className={styles.context}>{context}</p>

        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt>PM</dt>
            <dd>{people.pm}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>Tech Lead</dt>
            <dd>{people.tl}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>Engenharia</dt>
            <dd>{people.devs.join(" · ")}</dd>
          </div>
        </dl>

        {goals.length > 0 && (
          <div className={styles.goals}>
            <span className={styles.sectionLabel}>Metas</span>
            <ul className={styles.goalList}>
              {goals.map((goal, i) => (
                <li key={i} className={styles.goal}>
                  <span className={styles.goalValue}>{goal.value}</span>
                  <span className={styles.goalLabel}>{goal.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {projects.length > 0 && (
          <div className={styles.projects}>
            <span className={styles.sectionLabel}>Portfólio do trimestre</span>
            <div className={styles.projectTableHead} aria-hidden="true">
              <span className={styles.colLabel}>Projeto</span>
              <span className={styles.colLabel}>Status atual</span>
            </div>
            <ul className={styles.projectList}>
              {projects.map((project) => (
                <li key={project.id} className={styles.project}>
                  <div className={styles.projectMain}>
                    <h4 className={styles.projectTitle}>
                      {project.title}
                      {project.continuation && (
                        <span className={styles.continuation}>
                          Q1 → Q2
                        </span>
                      )}
                    </h4>
                    <p className={styles.projectDesc}>{project.description}</p>
                  </div>
                  <div className={styles.statusCell}>
                    <span className={styles.statusCellLabel}>Status</span>
                    <span
                      className={`${styles.status} ${styles[`status_${project.status}`]}`}
                    >
                      {STATUS_LABEL[project.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
