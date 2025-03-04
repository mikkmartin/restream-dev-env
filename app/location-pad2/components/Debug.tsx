'use client'

import { motion, MotionValue } from 'motion/react'
import { useState } from 'react'
import styles from '../page.module.scss'

interface DebugProps {
  normalizedX: MotionValue<number>
  normalizedY: MotionValue<number>
}

export function Debug({ normalizedX, normalizedY }: DebugProps) {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  normalizedX.on('change', setX)
  normalizedY.on('change', setY)

  return (
    <motion.pre
      className={styles.debug}
      style={{ position: 'absolute', y: -20 }}
    >
      Norm x: <span>{x}</span>, y: <span>{y}</span>
    </motion.pre>
  )
}
