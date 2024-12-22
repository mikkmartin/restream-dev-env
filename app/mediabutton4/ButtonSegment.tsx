import { motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import styles from './ButtonSegment.module.scss'
import { useMediaSelect } from './MediaSelect'

const SPRING_TRANSITION_SNAPPY = {
  type: 'spring',
  stiffness: 1000,
  damping: 20,
  mass: 0.01,
}

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
        <IconChevronUp
          key="chevron"
          className={styles.icon}
          transition={SPRING_TRANSITION_SNAPPY}
          animate={{ rotate: isOpen ? -180 : 0 }}
        />
      </button>
    </div>
  )
}

const IconChevronUp = motion(ChevronUp)
