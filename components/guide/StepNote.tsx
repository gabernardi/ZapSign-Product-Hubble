import styles from "./StepNote.module.css";

interface StepNoteProps {
  children: React.ReactNode;
}

export function StepNote({ children }: StepNoteProps) {
  return <div className={styles.note}>{children}</div>;
}
