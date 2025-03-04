'use client'

import { motion, useAnimation } from 'motion/react'
import { useRef } from 'react'
import { mergeRefs } from 'react-merge-refs'
import useMeasure from 'react-use-measure'
import styles from '../page.module.scss'
import { useAtom } from 'jotai'
import {
  snapPointsAtom,
  isDraggingAtom,
  isCommandPressedAtom,
  closestSnapPointIndexAtom,
  snappedPointIndexAtom,
  lastManualSnapPositionAtom,
  selectedShapeAtom,
  padScaleAtom,
} from '../atoms'
import { getShapeStyles } from '../utils'

export function DraggablePad() {
  const padContainerRef = useRef<HTMLDivElement>(null)
  const [padMeasureRef, padDimensions] = useMeasure()
  const draggableItemRef = useRef<HTMLDivElement>(null)

  const animationControls = useAnimation()
  const [snapPoints] = useAtom(snapPointsAtom)
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
  const [selectedShape] = useAtom(selectedShapeAtom)
  const [padScale] = useAtom(padScaleAtom)

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

  function handleDrag(event: any, info: any) {
    if (isCommandPressed) {
      setClosestSnapPointIndex(null)
      return
    }

    setIsDragging(true)
    const closestIndex = getClosestSnapPointIndex(info.point.x, info.point.y)
    setClosestSnapPointIndex(closestIndex)
  }

  function handleDragEnd(event: any, info: any) {
    if (isCommandPressed) {
      setSnappedPointIndex(null)
      return
    }

    setIsDragging(false)
    const snapPoint = getClosestSnapPoint(info.point.x, info.point.y)
    const snapIndex = getClosestSnapPointIndex(info.point.x, info.point.y)

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

    if (clickedIndex === snappedPointIndex) return

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

  return (
    <>
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
            width: 30 * padScale + '%',
            zIndex: 999,
            ...getShapeStyles(selectedShape),
          }}
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
    </>
  )
}
