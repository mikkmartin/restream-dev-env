import { ChevronDown } from 'lucide-react'
import styles from './ButtonSegment.module.scss'

export function ButtonSegment({
  children,
  ...rest
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.root}>
      {children}
      <button className={styles.trigger} {...rest}>
        <ChevronDown className={styles.icon} />
      </button>
    </div>
  )
}
