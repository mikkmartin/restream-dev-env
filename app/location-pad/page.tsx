'use client'

import {
  animationControls,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import styles from './page.module.scss'

export default function LocationPad() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const padContainerRef = useRef<HTMLDivElement>(null)
  const animationControls = useAnimation()

  // Track x and y position of the draggable item
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // State to track if Control key is pressed
  const [isControlPressed, setIsControlPressed] = useState(false)

  // Transform pad coordinates to canvas coordinates
  const canvasX = useTransform(x, [0, 100], [0, 400])
  const canvasY = useTransform(y, [0, 100], [0, 600])

  // Handle key events for precise movement
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Control') {
      setIsControlPressed(true)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Control') {
      setIsControlPressed(false)
    }
  }

  // Add event listeners when component mounts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  function handleDragEnd() {
    if (isControlPressed) return
    animationControls.start({ x: 0, y: 0 })
  }

  return (
    <div className={styles.container}>
      <div className={styles.canvas} ref={canvasContainerRef}>
        <motion.div
          className={styles.movableElement}
          style={{
            x: canvasX,
            y: canvasY,
          }}
        />
      </div>
      <div>
        <div ref={padContainerRef} className={styles.constraintsArea}>
          <motion.div
            drag
            onDragEnd={handleDragEnd}
            dragMomentum={false}
            animate={animationControls}
            style={{ x, y }}
            className={styles.draggableItem}
          />
        </div>
        <p>Hold control for precise movement.</p>
      </div>
    </div>
  )
}
