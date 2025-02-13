'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef } from 'react'
import styles from './page.module.scss'

export default function LocationPad() {
  const constraintsRef = useRef<HTMLDivElement>(null)

  // Track x and y position of the draggable item
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Transform pad coordinates to canvas coordinates
  const canvasX = useTransform(x, [-48, 48], [-40, 40])
  const canvasY = useTransform(y, [-48, 48], [-40, 40])

  return (
    <div className={styles.container}>
      <div className={styles.canvas}>
        <motion.div
          className={styles.movableElement}
          style={{
            x: canvasX + '%',
            y: canvasY + '%',
          }}
        />
      </div>
      <div ref={constraintsRef} className={styles.constraintsArea}>
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={constraintsRef}
          style={{ x, y }}
          className={styles.draggableItem}
        />
      </div>
    </div>
  )
}
