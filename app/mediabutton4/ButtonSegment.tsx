import { ChevronDown } from 'lucide-react'
import styles from './ButtonSegment.module.scss'
import { useMediaSelect } from './MediaSelect'
import { motion } from 'framer-motion'

export function ButtonSegment({
  children,
  ...rest
}: {
  children: React.ReactNode
}) {
  const { isOpen } = useMediaSelect()
  return (
    <div className={styles.root}>
      {children}
      <button className={styles.trigger} {...rest}>
        <Icon animate={{ rotate: isOpen ? 180 : 0 }} className={styles.icon} />
      </button>
    </div>
  )
}

const Icon = motion(ChevronDown)
