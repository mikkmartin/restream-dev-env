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
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: '30%', height: '30%' })
  const initialResizeData = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const [edgesTouchingContainer, setEdgesTouchingContainer] = useState({
    top: false,
    right: false,
    bottom: false,
    left: false,
  })

  useEffect(() => {
    const currentX = x.get()
    const currentY = y.get()
    const itemWidth = draggableItemDimensions.width
    const itemHeight = draggableItemDimensions.height

    const touching = {
      top: Math.abs(currentY) < 1, // Top edge is touching
      left: Math.abs(currentX) < 1, // Left edge is touching
      right: Math.abs(currentX + itemWidth - containerDimensions.width) < 1, // Right edge is touching
      bottom: Math.abs(currentY + itemHeight - containerDimensions.height) < 1, // Bottom edge is touching
    }

    setEdgesTouchingContainer(touching)
  }, [x, y, draggableItemDimensions, containerDimensions])

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
    setIsDragging(true)
    console.log('drag start')
  }

  const handleDrag = () => {
    console.log('drag')
  }

  const handleDragEnd = () => {
    setIsDragging(false)
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

  const startResize = (direction: string, e: React.PointerEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)

    // Store initial values
    initialResizeData.current = {
      x: e.clientX,
      y: e.clientY,
      width: draggableItemDimensions.width,
      height: draggableItemDimensions.height,
    }
  }

  const handleResize = (e: React.PointerEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - initialResizeData.current.x
    const deltaY = e.clientY - initialResizeData.current.y

    let newWidth = initialResizeData.current.width
    let newHeight = initialResizeData.current.height
    let newX = x.get()
    let newY = y.get()

    // Calculate aspect ratio for corner resizing
    const aspectRatio =
      initialResizeData.current.width / initialResizeData.current.height

    // Handle different resize directions
    switch (resizeDirection) {
      case 'right':
        newWidth = Math.max(50, initialResizeData.current.width + deltaX)
        break
      case 'bottom':
        newHeight = Math.max(50, initialResizeData.current.height + deltaY)
        break
      case 'left':
        newWidth = Math.max(50, initialResizeData.current.width - deltaX)
        newX = x.get() + (initialResizeData.current.width - newWidth)
        break
      case 'top':
        newHeight = Math.max(50, initialResizeData.current.height - deltaY)
        newY = y.get() + (initialResizeData.current.height - newHeight)
        break
      // Corner cases with aspect ratio preserved
      case 'topLeft':
        // Determine which delta is larger (using absolute values)
        if (Math.abs(deltaX / aspectRatio) > Math.abs(deltaY)) {
          // Width change is dominant
          newWidth = Math.max(50, initialResizeData.current.width - deltaX)
          newHeight = newWidth / aspectRatio
        } else {
          // Height change is dominant
          newHeight = Math.max(50, initialResizeData.current.height - deltaY)
          newWidth = newHeight * aspectRatio
        }
        newX = x.get() + (initialResizeData.current.width - newWidth)
        newY = y.get() + (initialResizeData.current.height - newHeight)
        break
      case 'topRight':
        if (Math.abs(deltaX / aspectRatio) > Math.abs(deltaY)) {
          // Width change is dominant
          newWidth = Math.max(50, initialResizeData.current.width + deltaX)
          newHeight = newWidth / aspectRatio
        } else {
          // Height change is dominant
          newHeight = Math.max(50, initialResizeData.current.height - deltaY)
          newWidth = newHeight * aspectRatio
        }
        newY = y.get() + (initialResizeData.current.height - newHeight)
        break
      case 'bottomLeft':
        if (Math.abs(deltaX / aspectRatio) > Math.abs(deltaY)) {
          // Width change is dominant
          newWidth = Math.max(50, initialResizeData.current.width - deltaX)
          newHeight = newWidth / aspectRatio
        } else {
          // Height change is dominant
          newHeight = Math.max(50, initialResizeData.current.height + deltaY)
          newWidth = newHeight * aspectRatio
        }
        newX = x.get() + (initialResizeData.current.width - newWidth)
        break
      case 'bottomRight':
        if (Math.abs(deltaX / aspectRatio) > Math.abs(deltaY)) {
          // Width change is dominant
          newWidth = Math.max(50, initialResizeData.current.width + deltaX)
          newHeight = newWidth / aspectRatio
        } else {
          // Height change is dominant
          newHeight = Math.max(50, initialResizeData.current.height + deltaY)
          newWidth = newHeight * aspectRatio
        }
        break
    }

    // Update position and dimensions
    x.set(newX)
    y.set(newY)
    setDimensions({
      width: `${newWidth}px`,
      height: `${newHeight}px`,
    })
  }

  const endResize = () => {
    if (isResizing) {
      setIsResizing(false)
      setResizeDirection(null)
    }
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('pointermove', handleResize as any)
      document.addEventListener('pointerup', endResize)
      return () => {
        document.removeEventListener('pointermove', handleResize as any)
        document.removeEventListener('pointerup', endResize)
      }
    }
  }, [isResizing])

  // Listen for x and y motion values changes to update edge state
  useEffect(() => {
    const unsubscribeX = x.on('change', () => {
      const currentX = x.get()
      const itemWidth = draggableItemDimensions.width

      setEdgesTouchingContainer((prev) => ({
        ...prev,
        left: Math.abs(currentX) < 1,
        right: Math.abs(currentX + itemWidth - containerDimensions.width) < 1,
      }))
    })

    const unsubscribeY = y.on('change', () => {
      const currentY = y.get()
      const itemHeight = draggableItemDimensions.height

      setEdgesTouchingContainer((prev) => ({
        ...prev,
        top: Math.abs(currentY) < 1,
        bottom:
          Math.abs(currentY + itemHeight - containerDimensions.height) < 1,
      }))
    })

    return () => {
      unsubscribeX()
      unsubscribeY()
    }
  }, [
    x,
    y,
    draggableItemDimensions.width,
    draggableItemDimensions.height,
    containerDimensions.width,
    containerDimensions.height,
  ])

  return (
    <div className="flex gap-8 w-full min-w-[30rem] justify-start items-start">
      <div
        className="flex-1 aspect-[16/10] relative bg-[#f3f4f627] overflow-hidden"
        ref={containerMeasureRef}
      >
        <motion.div
          ref={draggableItemMeasureRef}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onPointerUp={!isResizing ? handleDragEnd : undefined}
          onDragEnd={handleDragEnd}
          style={{
            x,
            y,
            width: dimensions.width,
            height: dimensions.height,
            position: 'relative',
            touchAction: 'none',
          }}
          className="relative bg-red-500 cursor-grab rounded-lg touch-none select-none"
          animate={animationControls}
          drag={!isResizing}
          dragMomentum={false}
        >
          {/* Resize handles - only show if the corresponding edge is not touching the container */}
          {!edgesTouchingContainer.top && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 h-2 w-[calc(100%-16px)] left-2 top-0 -translate-y-1/2 cursor-ns-resize"
              onPointerDown={(e) => startResize('top', e)}
            />
          )}

          {!edgesTouchingContainer.right && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 w-2 h-[calc(100%-16px)] top-2 right-0 translate-x-1/2 cursor-ew-resize"
              onPointerDown={(e) => startResize('right', e)}
            />
          )}

          {!edgesTouchingContainer.bottom && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 h-2 w-[calc(100%-16px)] left-2 bottom-0 translate-y-1/2 cursor-ns-resize"
              onPointerDown={(e) => startResize('bottom', e)}
            />
          )}

          {!edgesTouchingContainer.left && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 w-2 h-[calc(100%-16px)] top-2 left-0 -translate-x-1/2 cursor-ew-resize"
              onPointerDown={(e) => startResize('left', e)}
            />
          )}

          {/* Corner handles - only show if neither of the corresponding edges are touching */}
          {!edgesTouchingContainer.top && !edgesTouchingContainer.left && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 w-3 h-3 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
              onPointerDown={(e) => startResize('topLeft', e)}
            />
          )}

          {!edgesTouchingContainer.top && !edgesTouchingContainer.right && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 w-3 h-3 rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
              onPointerDown={(e) => startResize('topRight', e)}
            />
          )}

          {!edgesTouchingContainer.bottom && !edgesTouchingContainer.left && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 w-3 h-3 rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
              onPointerDown={(e) => startResize('bottomLeft', e)}
            />
          )}

          {!edgesTouchingContainer.bottom && !edgesTouchingContainer.right && (
            <div
              className="absolute bg-black/10 hover:bg-black/20 z-10 w-3 h-3 rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
              onPointerDown={(e) => startResize('bottomRight', e)}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
