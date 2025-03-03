'use client'

import {
  motion,
  MotionValue,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import styles from './page.module.scss'
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'

// Define shape types
const shapes = ['landscape', 'portrait', 'square', 'circle'] as const
type Shape = (typeof shapes)[number]

export default function LocationPad() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasMeasureRef, canvasDimensions] = useMeasure()

  const padContainerRef = useRef<HTMLDivElement>(null)
  const [padMeasureRef, padDimensions] = useMeasure()

  const draggableItemRef = useRef<HTMLDivElement>(null)
  const [draggableItemMeasureRef, draggableItemDimensions] = useMeasure()

  const animationControls = useAnimation()

  // Add state for shape selection
  const [selectedShape, setSelectedShape] = useState<Shape>('landscape')
  const [canvasElementRef, canvasElementDimensions] = useMeasure()

  // Track x and y position of the draggable item
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const normalizedX = useTransform(
    x,
    [0, padDimensions.width - draggableItemDimensions.width],
    [0, 1],
    { clamp: false },
  )
  const normalizedY = useTransform(
    y,
    [0, padDimensions.height - draggableItemDimensions.height],
    [0, 1],
    { clamp: false },
  )

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
    }

    updateCanvasDimensions()
    window.addEventListener('resize', updateCanvasDimensions)
    return () => window.removeEventListener('resize', updateCanvasDimensions)
  }, [])

  // Transform pad coordinates to canvas coordinates using dynamic dimensions
  const canvasX = useTransform(
    normalizedX,
    [0, 1],
    [0, canvasDimensions.width - canvasElementDimensions.width],
    {
      clamp: false,
    },
  )
  const canvasY = useTransform(
    normalizedY,
    [0, 1],
    [0, canvasDimensions.height - canvasElementDimensions.height],
    {
      clamp: false,
    },
  )

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
      <div
        className={styles.canvas}
        ref={mergeRefs([canvasContainerRef, canvasMeasureRef])}
      >
        <motion.div
          ref={canvasElementRef}
          className={styles.movableElement}
          style={{
            x: canvasX,
            y: canvasY,
          }}
        />
      </div>
      <div>
        <Debug normalizedX={normalizedX} normalizedY={normalizedY} />
        {/* Pad container */}
        <div
          ref={mergeRefs([padContainerRef, padMeasureRef])}
          className={styles.constraintsArea}
        >
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
            ref={mergeRefs([draggableItemRef, draggableItemMeasureRef])}
            className={styles.draggableItem}
          />
        </div>

        {/* Pad instructions */}
        <div className={styles.instructions}>
          <motion.p animate={{ opacity: isDragging ? 1 : 0 }}>
            Hold ⌘ Command for precise movement.
          </motion.p>
          <motion.p animate={{ opacity: isCommandPressed ? 1 : 0 }}>
            Holding Command.
          </motion.p>
        </div>

        {/* Shape selection radio inputs */}
        <div className={styles.shapeSelector}>
          <p>Shape:</p>
          <div className={styles.radioGroup}>
            {shapes.map((shape) => (
              <label className={styles.radioLabel} key={shape}>
                <input
                  type="radio"
                  name="shape"
                  value={shape}
                  checked={selectedShape === shape}
                  onChange={() => setSelectedShape(shape)}
                />
                {shape}
              </label>
            ))}
          </div>
        </div>

        {/* Scale slider */}
        <div className={styles.scaleControl}>
          <p>Scale:</p>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              className={styles.slider}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Debug({
  normalizedX,
  normalizedY,
}: {
  normalizedX: MotionValue<number>
  normalizedY: MotionValue<number>
}) {
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
