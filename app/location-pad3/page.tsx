'use client'

import {
  motion,
  MotionValue,
  useAnimation,
  useMotionValue,
  useTransform,
  ValueAnimationTransition,
} from 'motion/react'
import {
  useRef,
  useState,
  useEffect,
  ComponentProps,
  CSSProperties,
} from 'react'
import styles from './page.module.scss'
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'
import { clamp } from 'motion'
import { atom, useAtom } from 'jotai'

const snapPointsAtom = atom<Array<{ x: number; y: number }>>([])

export default function Page() {
  const [draggableItemMeasureRef, draggableItemDimensions] = useMeasure()
  const [containerMeasureRef, containerDimensions] = useMeasure()
  const [snapPoints, setSnapPoints] = useAtom(snapPointsAtom)
  const animationControls = useAnimation()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const updateSnapPoints = () => {
      // Calculate center positions
      const horizontalCenter =
        containerDimensions.width / 2 - draggableItemDimensions.width / 2
      const verticalCenter =
        containerDimensions.height / 2 - draggableItemDimensions.height / 2

      const points = [
        { x: 0, y: 0 }, // Top left
        { x: containerDimensions.width - draggableItemDimensions.width, y: 0 }, // Top right
        { x: 0, y: verticalCenter }, // Middle left
        {
          x: containerDimensions.width - draggableItemDimensions.width,
          y: verticalCenter,
        }, // Middle right
        { x: horizontalCenter, y: verticalCenter }, // Center
        { x: horizontalCenter, y: 0 }, // Top center
        {
          x: horizontalCenter,
          y: containerDimensions.height - draggableItemDimensions.height,
        }, // Bottom center
        {
          x: 0,
          y: containerDimensions.height - draggableItemDimensions.height,
        }, // Bottom left
        {
          x: containerDimensions.width - draggableItemDimensions.width,
          y: containerDimensions.height - draggableItemDimensions.height,
        }, // Bottom right
      ]

      setSnapPoints(points)
    }

    updateSnapPoints()
  }, [draggableItemDimensions, containerDimensions, setSnapPoints])

  const handleDragStart = () => {
    console.log('drag start')
  }

  const handleDrag = () => {
    console.log('drag')
  }

  const handleDragEnd = () => {
    const snapPos = getClosestSnapPoint(x.get(), y.get())
    animationControls.start({ x: snapPos.x, y: snapPos.y })
  }

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

  return (
    <div className={styles.container}>
      <div className={styles.canvas} ref={containerMeasureRef}>
        <motion.div
          ref={draggableItemMeasureRef}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onPointerUp={handleDragEnd}
          onDragEnd={handleDragEnd}
          style={{ x, y, width: '30%' }}
          className={styles.draggableItem}
          animate={animationControls}
          drag
        />
      </div>
    </div>
  )
}
