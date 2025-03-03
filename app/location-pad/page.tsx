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

  // Add state for canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  })

  // Track x and y position of the draggable item
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const [isDragging, setIsDragging] = useState(false)

  // State to track if Command key is pressed and container dimensions
  const [isCommandPressed, setIsCommandPressed] = useState(false)
  const [snapPoints, setSnapPoints] = useState<Array<{ x: number; y: number }>>(
    [],
  )

  // Add state for tracking closest snap point
  const [closestSnapPointIndex, setClosestSnapPointIndex] = useState<
    number | null
  >(null)

  // Update canvas dimensions on mount and resize
  useEffect(() => {
    const updateCanvasDimensions = () => {
      const canvas = canvasContainerRef.current
      const pad = padContainerRef.current
      if (!canvas || !pad) return
      //calculate the ratio between the canvas and the pad
      const ratioWidth =
        canvas.getBoundingClientRect().width / pad.getBoundingClientRect().width
      const ratioHeight =
        canvas.getBoundingClientRect().height /
        pad.getBoundingClientRect().height

      setCanvasDimensions({
        width: 100 * ratioWidth,
        height: 100 * ratioHeight,
      })
    }

    updateCanvasDimensions()
    window.addEventListener('resize', updateCanvasDimensions)
    return () => window.removeEventListener('resize', updateCanvasDimensions)
  }, [])

  // Transform pad coordinates to canvas coordinates using dynamic dimensions
  const canvasX = useTransform(x, [0, 100], [0, canvasDimensions.width], {
    clamp: false,
  })
  const canvasY = useTransform(y, [0, 100], [0, canvasDimensions.height], {
    clamp: false,
  })

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

  function getClosestSnapPointIndex(currentX: number, currentY: number) {
    if (snapPoints.length === 0) return null

    let closestIndex = 0
    let minDistance = Infinity

    snapPoints.forEach((point, index) => {
      const distance = Math.sqrt(
        Math.pow(currentX - point.x, 2) + Math.pow(currentY - point.y, 2),
      )
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
  }

  function handleDrag() {
    if (isCommandPressed) {
      setClosestSnapPointIndex(null)
      return
    }

    setIsDragging(true)

    // Get current position
    const currentX = x.get()
    const currentY = y.get()

    // Find and set closest snap point index
    const closestIndex = getClosestSnapPointIndex(currentX, currentY)
    setClosestSnapPointIndex(closestIndex)
  }

  function handleDragEnd() {
    if (isCommandPressed) return

    setIsDragging(false)

    const draggable = draggableItemRef.current
    if (!draggable) return

    // Get current position
    const currentX = x.get()
    const currentY = y.get()

    // Find closest snap point
    const snapPoint = getClosestSnapPoint(currentX, currentY)

    // Reset closest snap point highlight
    setClosestSnapPointIndex(null)

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

  function handleDragStart() {
    setIsDragging(true)
  }

  function handleSnapPointClick(point: { x: number; y: number }) {
    if (isCommandPressed) return

    // Animate to clicked snap point
    animationControls.start({
      x: point.x,
      y: point.y,
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
          {snapPoints.map((point, index) => (
            <motion.div
              key={index}
              animate={{
                opacity: !isCommandPressed ? 1 : 0,
              }}
              className={`${styles.snapPoint} ${
                index === closestSnapPointIndex ? styles.snapPointActive : ''
              }`}
              style={{
                transform: `translate(${point.x}px, ${point.y}px)`,
                position: 'absolute',
              }}
              onClick={() => handleSnapPointClick(point)}
            />
          ))}
          <motion.div
            drag
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onPointerUp={handleDragEnd}
            onDragEnd={handleDragEnd}
            dragMomentum={false}
            animate={animationControls}
            style={{ x, y }}
            ref={draggableItemRef}
            className={styles.draggableItem}
          />
        </div>
        <div className={styles.instructions}>
          <motion.p animate={{ opacity: isDragging ? 1 : 0 }}>
            Hold ⌘ Command for precise movement.
          </motion.p>
          <motion.p animate={{ opacity: isCommandPressed ? 1 : 0 }}>
            Holding Command.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
