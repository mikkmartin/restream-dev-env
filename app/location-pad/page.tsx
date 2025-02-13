'use client'

import {
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
  const draggableItemRef = useRef<HTMLDivElement>(null)
  // Track x and y position of the draggable item
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // State to track if Command key is pressed and container dimensions
  const [isCommandPressed, setIsCommandPressed] = useState(false)
  const [snapPoints, setSnapPoints] = useState<Array<{ x: number; y: number }>>(
    [],
  )

  // Transform pad coordinates to canvas coordinates
  const canvasX = useTransform(x, [0, 100], [0, 400], { clamp: false })
  const canvasY = useTransform(y, [0, 100], [0, 600], { clamp: false })

  // Calculate snap points based on container size
  useEffect(() => {
    const updateSnapPoints = () => {
      const container = padContainerRef.current
      const draggable = draggableItemRef.current
      if (!container || !draggable) return

      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect()
      const { width: itemWidth, height: itemHeight } =
        draggable.getBoundingClientRect()

      // Adjust positions to account for draggable item center
      const halfItemWidth = itemWidth / 2
      const halfItemHeight = itemHeight / 2

      const points = [
        // Corners
        { x: halfItemWidth, y: halfItemHeight }, // top-left
        { x: containerWidth - halfItemWidth, y: halfItemHeight }, // top-right
        { x: halfItemWidth, y: containerHeight - halfItemHeight }, // bottom-left
        {
          x: containerWidth - halfItemWidth,
          y: containerHeight - halfItemHeight,
        }, // bottom-right
        // Sides
        { x: containerWidth / 2, y: halfItemHeight }, // top
        { x: containerWidth / 2, y: containerHeight - halfItemHeight }, // bottom
        { x: halfItemWidth, y: containerHeight / 2 }, // left
        { x: containerWidth - halfItemWidth, y: containerHeight / 2 }, // right
      ].map((point) => ({
        x: point.x - halfItemWidth,
        y: point.y - halfItemHeight,
      }))

      setSnapPoints(points)
    }

    updateSnapPoints()
    window.addEventListener('resize', updateSnapPoints)
    return () => window.removeEventListener('resize', updateSnapPoints)
  }, [])

  // Handle key events for precise movement
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey) {
      setIsCommandPressed(true)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!e.metaKey) {
      setIsCommandPressed(false)
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

  function getClosestSnapPoint(currentX: number, currentY: number) {
    if (snapPoints.length === 0) return { x: currentX, y: currentY }

    let closestPoint = snapPoints[0]
    let minDistance = Infinity

    snapPoints.forEach((point) => {
      const distance = Math.sqrt(
        Math.pow(currentX - point.x, 2) + Math.pow(currentY - point.y, 2),
      )
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = point
      }
    })

    return closestPoint
  }

  function handleDragEnd() {
    if (isCommandPressed) return

    const draggable = draggableItemRef.current
    if (!draggable) return

    // Get current position
    const currentX = x.get()
    const currentY = y.get()

    // Find closest snap point
    const snapPoint = getClosestSnapPoint(currentX, currentY)

    // Animate to snap point
    animationControls.start({
      x: snapPoint.x,
      y: snapPoint.y,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      },
    })
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
            ref={draggableItemRef}
            className={styles.draggableItem}
          />
        </div>
        <p>Hold ⌘ Command for precise movement.</p>
        {isCommandPressed && <p>Holding Command.</p>}
      </div>
    </div>
  )
}
