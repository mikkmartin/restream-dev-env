'use client'

import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus
} from 'lucide-react'

export default function LocationPad() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const padContainerRef = useRef<HTMLDivElement>(null)
  const animationControls = useAnimation()
  const draggableItemRef = useRef<HTMLDivElement>(null)

  const [padding, setPadding] = useState(0)
  const [size, setSize] = useState(0)
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

        // Center
        { x: containerWidth / 2, y: containerHeight / 2 },
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
    <div className="flex gap-8 w-full min-w-[30rem] justify-start items-start">
      <div className="flex-1 aspect-[16/10] relative bg-[#f3f4f627] overflow-hidden" ref={canvasContainerRef}>
        <motion.div
          className="absolute w-[30%] aspect-[16/10] bg-red-500 rounded-2xl transition-transform duration-100 ease-out"
          style={{
            x: canvasX,
            y: canvasY,
          }}
        />
      </div>
      <div>
        <div ref={padContainerRef} className="relative aspect-[16/10] bg-[#f3f4f627] max-w-[10rem] overflow-hidden">
          {snapPoints.map((point, index) => {
            const Icon = [
              CornerUpLeft, // top-left
              CornerUpRight, // top-right
              CornerDownLeft, // bottom-left
              CornerDownRight, // bottom-right
              ArrowUp, // top
              ArrowDown, // bottom
              ArrowLeft, // left
              ArrowRight, // right
              Plus // center
            ][index]

            return (
              <motion.div
                key={index}
                animate={{
                  opacity: !isCommandPressed ? 1 : 0,
                }}
                className={`absolute w-[30%] aspect-[16/10] bg-red-500/10 border border-red-500/20 rounded transition-all duration-200 ease-in-out cursor-pointer pointer-events-auto hover:bg-red-500/20 hover:border-red-500/40 flex items-center justify-center ${index === closestSnapPointIndex ? 'bg-red-500/35 border-2 border-red-500/60 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' : ''}`}
                style={{
                  transform: `translate(${point.x}px, ${point.y}px)`,
                }}
                onClick={() => handleSnapPointClick(point)}
              >
                <Icon className="w-4 h-4 text-red-500/60" />
              </motion.div>
            )
          })}
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
            className="w-[30%] aspect-[16/10] bg-red-500 cursor-grab rounded-sm z-[999] active:cursor-grabbing"
          />
        </div>
        <div className="py-2 flex flex-col gap-1">
          <motion.p animate={{ opacity: isDragging ? 1 : 0 }}>
            Hold ⌘ Command for precise movement.
          </motion.p>
          <motion.p animate={{ opacity: isCommandPressed ? 1 : 0 }}>
            Holding Command.
          </motion.p>
        </div>

        <div className="flex gap-2">
          <input
            type="checkbox"
            id="multipleElements"
            onChange={(e) => {
              const checked = e.target.checked
              setIsCommandPressed(!checked)
            }}
          />
          <label htmlFor="multipleElements">Snap</label>
        </div>

        {/* Padding slider */}
        <div className="flex flex-col gap-2">
          <p>Padding: {padding.toFixed(2)}</p>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              className="w-full"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Size slider */}
        <div className="flex flex-col gap-2">
          <p>Size: {size.toFixed(2)}</p>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              className="w-full"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
