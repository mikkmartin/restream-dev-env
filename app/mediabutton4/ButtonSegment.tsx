import { ChevronDown, X } from 'lucide-react'
import styles from './ButtonSegment.module.scss'
import { useMediaSelect } from './MediaSelect'
import { AnimatePresence, motion } from 'framer-motion'

const SPRING_TRANSITION_SMOOTH = {
  type: 'spring',
  stiffness: 800,
  damping: 60,
  mass: 0.1,
}
const ICON_OFFSET = 22

export function ButtonSegment({
  children,
  ...rest
}: {
  children: React.ReactNode
}) {
  const { isOpen } = useMediaSelect()
  return (
    <div className={styles.root}>
      <motion.div
        className={styles.content}
        animate={{
          scale: isOpen ? 0.9 : 1,
          y: !isOpen ? 0 : -30,
          opacity: !isOpen ? 1 : 0,
        }}
        transition={{
          ...SPRING_TRANSITION_SMOOTH,
          opacity: { duration: 0.1 },
        }}
      >
        {children}
      </motion.div>
      <button className={styles.trigger} {...rest}>
        <AnimatePresence mode="popLayout" initial={false}>
          {!isOpen ? (
            <IconChevronDown
              key="chevron"
              className={styles.icon}
              transition={{
                ...SPRING_TRANSITION_SMOOTH,
                opacity: { duration: 0.1 },
              }}
              initial={{ x: -ICON_OFFSET, opacity: 0, rotate: 90 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -ICON_OFFSET, opacity: 0, rotate: 90 }}
            />
          ) : (
            <IconX
              key="x"
              className={styles.icon}
              transition={{
                ...SPRING_TRANSITION_SMOOTH,
                opacity: { duration: 0.1 },
              }}
              initial={{ x: 0, opacity: 0, rotate: 0 }}
              animate={{ x: -ICON_OFFSET, opacity: 1, rotate: 90 }}
              exit={{ x: 0, opacity: 0, rotate: 0 }}
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}

const IconChevronDown = motion(ChevronDown)
const IconX = motion(X)
