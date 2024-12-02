import { ChevronDown } from 'lucide-react'
import styles from './ButtonSegment.module.scss'

export function ButtonSegment({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      {children}
      <button className={styles.trigger}>
        <ChevronDown />
      </button>
    </div>
  )
}
