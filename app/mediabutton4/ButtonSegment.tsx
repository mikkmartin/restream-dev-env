import styles from './ButtonSegment.module.scss'

export function ButtonSegment({ children }: { children: React.ReactNode }) {
  return <div className={styles.root}>{children}</div>
}
