'use client'

import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { useRef, useEffect } from 'react'
import styles from '../page.module.scss'
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'
import { useAtom } from 'jotai'
import { Shape } from '../types'
import {
  scaleAtom,
  paddingAtom,
  selectedShapeAtom,
  multipleElementsAtom,
  snapPointsAtom,
  isDraggingAtom,
  isCommandPressedAtom,
  closestSnapPointIndexAtom,
  snappedPointIndexAtom,
  lastManualSnapPositionAtom,
} from '../atoms'
import { CanvasElement } from './CanvasElement'
import { getShapeStyles } from '../utils'

export function Canvas() {
  const [scale] = useAtom(scaleAtom)
  const [padding] = useAtom(paddingAtom)
  const [selectedShape] = useAtom(selectedShapeAtom)
  const [multipleElements] = useAtom(multipleElementsAtom)
  const [snapPoints, setSnapPoints] = useAtom(snapPointsAtom)
  const [isDragging, setIsDragging] = useAtom(isDraggingAtom)
  const [isCommandPressed] = useAtom(isCommandPressedAtom)
  const [closestSnapPointIndex, setClosestSnapPointIndex] = useAtom(
    closestSnapPointIndexAtom,
  )
  const [snappedPointIndex, setSnappedPointIndex] = useAtom(
    snappedPointIndexAtom,
  )
  const [lastManualSnapPosition, setLastManualSnapPosition] = useAtom(
    lastManualSnapPositionAtom,
  )

  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasMeasureRef, canvasDimensions] = useMeasure()
  const [canvasElementRef, canvasElementDimensions] = useMeasure()

  const padContainerRef = useRef<HTMLDivElement>(null)
  const [padMeasureRef, padDimensions] = useMeasure()

  const draggableItemRef = useRef<HTMLDivElement>(null)
  const [draggableItemMeasureRef, draggableItemDimensions] = useMeasure()

  const animationControls = useAnimation()

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

  // Transform pad coordinates to canvas coordinates
  const canvasX = useTransform(
    normalizedX,
    [0, 1],
    [padding, canvasDimensions.width - canvasElementDimensions.width - padding],
    { clamp: false },
  )
  const canvasY = useTransform(
    normalizedY,
    [0, 1],
    [
      padding,
      canvasDimensions.height - canvasElementDimensions.height - padding,
    ],
    { clamp: false },
  )

  // Calculate the pad scale value
  const getPadMaxScale = (shape: Shape) => {
    switch (shape) {
      case 'portrait':
        return 0.45
      case 'circle':
        return 0.65
      case 'square':
        return 0.65
      default:
        return 1
    }
  }

  const maxScale = getPadMaxScale(selectedShape)
  const padScale = Math.min(0.15, maxScale - padding / 100, scale)

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
    if (isCommandPressed) {
      setSnappedPointIndex(null)
      return
    }

    setIsDragging(false)

    const currentX = x.get()
    const currentY = y.get()

    const snapPoint = getClosestSnapPoint(currentX, currentY)
    const snapIndex = getClosestSnapPointIndex(currentX, currentY)

    setClosestSnapPointIndex(null)
    setSnappedPointIndex(snapIndex)

    setLastManualSnapPosition({
      index: snapIndex,
      x: snapPoint.x,
      y: snapPoint.y,
    })

    animationControls.start({
      x: snapPoint.x,
      y: snapPoint.y,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25,
        mass: 1,
      },
    })
  }

  function handleDragStart() {
    setIsDragging(true)
  }

  function handleSnapPointClick(point: { x: number; y: number }) {
    if (isCommandPressed) return

    const clickedIndex = snapPoints.findIndex(
      (p) => p.x === point.x && p.y === point.y,
    )

    if (clickedIndex === snappedPointIndex) {
      return
    }

    setLastManualSnapPosition({
      index: clickedIndex,
      x: point.x,
      y: point.y,
    })

    animationControls.start({
      x: point.x,
      y: point.y,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25,
        mass: 1,
      },
    })

    setSnappedPointIndex(clickedIndex)
  }

  // Calculate snap points based on container size
  useEffect(() => {
    const updateSnapPoints = () => {
      const container = padContainerRef.current
      const draggable = draggableItemRef.current
      if (!container || !draggable) return

      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect()

      const shapeStyle = getShapeStyles(selectedShape)
      const aspectRatioStr = shapeStyle.aspectRatio as string
      const [widthRatio, heightRatio] = aspectRatioStr.split('/').map(Number)

      const baseWidth = containerWidth * 0.3 * padScale
      let itemWidth, itemHeight

      if (selectedShape === 'landscape') {
        itemWidth = baseWidth
        itemHeight = baseWidth * (heightRatio / widthRatio)
      } else if (selectedShape === 'portrait') {
        itemWidth = baseWidth
        itemHeight = baseWidth * (heightRatio / widthRatio)
      } else {
        itemWidth = baseWidth
        itemHeight = baseWidth
      }

      const halfItemWidth = itemWidth / 2
      const halfItemHeight = itemHeight / 2

      const points = [
        { x: padding + halfItemWidth, y: padding + halfItemHeight },
        {
          x: containerWidth - padding - halfItemWidth,
          y: padding + halfItemHeight,
        },
        {
          x: padding + halfItemWidth,
          y: containerHeight - padding - halfItemHeight,
        },
        {
          x: containerWidth - padding - halfItemWidth,
          y: containerHeight - padding - halfItemHeight,
        },
        { x: containerWidth / 2, y: padding + halfItemHeight },
        {
          x: containerWidth / 2,
          y: containerHeight - padding - halfItemHeight,
        },
        { x: padding + halfItemWidth, y: containerHeight / 2 },
        { x: containerWidth - padding - halfItemWidth, y: containerHeight / 2 },
      ].map((point) => ({
        x: point.x - halfItemWidth,
        y: point.y - halfItemHeight,
      }))

      setSnapPoints(points)
    }

    updateSnapPoints()
    window.addEventListener('resize', updateSnapPoints)
    return () => window.removeEventListener('resize', updateSnapPoints)
  }, [scale, padding, selectedShape, padScale, setSnapPoints])

  return (
    <div
      className={styles.canvas}
      ref={mergeRefs([canvasContainerRef, canvasMeasureRef])}
    >
      <CanvasElement
        ref={canvasElementRef}
        shape={selectedShape}
        multiple={multipleElements}
        snapIndex={isDragging ? closestSnapPointIndex : snappedPointIndex}
        scale={scale}
        style={{
          x: canvasX,
          y: canvasY,
          ...getShapeStyles(selectedShape),
        }}
        animate={{
          width: `calc(${
            selectedShape === 'portrait' ? 20 : 30
          } * ${scale}% - ${padding * 2}px)`,
        }}
      />

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
            } ${index === snappedPointIndex ? styles.snapPointSnapped : ''}`}
            style={{
              transform: `translate(${point.x}px, ${point.y}px)`,
              position: 'absolute',
              width: 30 * padScale + '%',
              pointerEvents: index === snappedPointIndex ? 'none' : 'auto',
              ...getShapeStyles(selectedShape),
            }}
            onClick={() => handleSnapPointClick(point)}
          >
            <motion.span
              initial={false}
              animate={{
                opacity: false ? 1 : 0,
              }}
            >
              {index}
            </motion.span>
          </motion.div>
        ))}
        <motion.div
          drag
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onPointerUp={handleDragEnd}
          onDragEnd={handleDragEnd}
          dragMomentum={false}
          animate={animationControls}
          style={{
            x,
            y,
            width: 30 * padScale + '%',
            zIndex: 999,
            ...getShapeStyles(selectedShape),
          }}
          ref={mergeRefs([draggableItemRef, draggableItemMeasureRef])}
          className={styles.draggableItem}
        />
      </div>
    </div>
  )
}
