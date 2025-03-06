'use client'

import { atom } from 'jotai'
import { useAtom, useSetAtom } from 'jotai'
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  MotionValue,
} from 'motion/react'
import {
  ComponentProps,
  CSSProperties,
  forwardRef,
  useRef,
  useEffect,
  useState,
} from 'react'
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'
import styles from './page.module.scss'
import { motionValue } from 'motion/react'

// Atoms
const scaleAtom = atom(1)
const paddingAtom = atom(10)
const selectedShapeAtom = atom<Shape>('landscape')
const multipleElementsAtom = atom(false)
const snapPointsAtom = atom<Array<{ x: number; y: number }>>([])
const isDraggingAtom = atom(false)
const isCommandPressedAtom = atom(false)
const closestSnapPointIndexAtom = atom<number | null>(null)
const snappedPointIndexAtom = atom<number | null>(null)
const lastManualSnapPositionAtom = atom<{
  index: number | null
  x: number
  y: number
} | null>(null)
const canvasPositionAtom = atom<{
  x: MotionValue<number>
  y: MotionValue<number>
}>({ x: motionValue(0), y: motionValue(0) })
const canvasDimensionsAtom = atom<{ width: number; height: number }>({
  width: 0,
  height: 0,
})
const canvasElementDimensionsAtom = atom<{ width: number; height: number }>({
  width: 0,
  height: 0,
})

export default function Page() {
  return (
    <div className={styles.container}>
      <Canvas />
      <EditPanel />
    </div>
  )
}

// Types
export const shapes = ['landscape', 'portrait', 'square', 'circle'] as const
export type Shape = (typeof shapes)[number]

// Utils
export const getShapeStyles = (shape: Shape): CSSProperties => {
  switch (shape) {
    case 'portrait':
      return {
        aspectRatio: '3/4',
        borderRadius: '8px',
      }
    case 'circle':
      return {
        aspectRatio: '1',
        borderRadius: '50%',
      }
    case 'square':
      return {
        aspectRatio: '1',
        borderRadius: '8px',
      }
    default:
      return {
        aspectRatio: '16/9',
        borderRadius: '8px',
      }
  }
}

const transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 1,
} as const

// Components
type CanvasElementProps = ComponentProps<typeof motion.div> & {
  shape?: Shape
  multiple?: boolean
  snapIndex: number | null
  scale: number
}

const CanvasElement = forwardRef<HTMLDivElement, CanvasElementProps>(
  function CanvasElement(props, ref) {
    const getStyles = (): CSSProperties => {
      switch (props.snapIndex) {
        case 0:
        case 2:
          return {
            flexDirection: 'row',
          }
        case 6:
          return {
            flexDirection: 'column',
          }
        case 1:
        case 7:
        case 3:
          return {
            flexDirection: 'row-reverse',
          }
        case 4:
        case 5:
          return {
            flexDirection: 'row',
            justifyContent: 'center',
          }
        default:
          return {
            flexDirection: 'column-reverse',
          }
      }
    }

    if (props.multiple) {
      const finalStyles = {
        x: props.style?.x,
        y: props.style?.y,
        aspectRatio: props.style?.aspectRatio,
        borderRadius: props.style?.borderRadius,
        ...getStyles(),
      }
      return (
        <motion.div
          {...props}
          ref={ref}
          className={styles.ghostContainer}
          style={finalStyles}
        >
          <motion.div
            layout
            transition={transition}
            className={styles.movableElement}
          />
          {props.scale <= 1.2 && (
            <motion.div
              layout
              transition={transition}
              className={styles.ghostElement}
            />
          )}
          {props.scale <= 0.7 && (
            <motion.div
              layout
              transition={transition}
              className={styles.ghostElement}
            />
          )}
        </motion.div>
      )
    }
    return <motion.div {...props} ref={ref} className={styles.movableElement} />
  },
)

interface DebugProps {
  normalizedX: MotionValue<number>
  normalizedY: MotionValue<number>
}

function Debug({ normalizedX, normalizedY }: DebugProps) {
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

function DraggablePad() {
  const [scale] = useAtom(scaleAtom)
  const [padding] = useAtom(paddingAtom)
  const [selectedShape] = useAtom(selectedShapeAtom)
  const [snapPoints, setSnapPoints] = useAtom(snapPointsAtom)
  const [isDragging, setIsDragging] = useAtom(isDraggingAtom)
  const [isCommandPressed] = useAtom(isCommandPressedAtom)
  const [closestSnapPointIndex, setClosestSnapPointIndex] = useAtom(
    closestSnapPointIndexAtom,
  )
  const [snappedPointIndex, setSnappedPointIndex] = useAtom(
    snappedPointIndexAtom,
  )
  const setLastManualSnapPosition = useSetAtom(lastManualSnapPositionAtom)

  const padContainerRef = useRef<HTMLDivElement>(null)
  const [padMeasureRef, padDimensions] = useMeasure()

  const draggableItemRef = useRef<HTMLDivElement>(null)
  const [draggableItemMeasureRef, draggableItemDimensions] = useMeasure()

  const animationControls = useAnimation()

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

  const [canvasDimensions] = useAtom(canvasDimensionsAtom)
  const [canvasElementDimensions] = useAtom(canvasElementDimensionsAtom)

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

  const setPosition = useSetAtom(canvasPositionAtom)
  useEffect(() => {
    setPosition({ x: canvasX, y: canvasY })
  }, [canvasX, canvasY])

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

    const currentX = x.get()
    const currentY = y.get()

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
      transition,
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
      transition,
    })

    setSnappedPointIndex(clickedIndex)
  }

  useEffect(() => {
    const updateSnapPoints = () => {
      const container = padContainerRef.current
      const draggable = draggableItemRef.current
      if (!container || !draggable) return

      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect()

      // Get the current shape's aspect ratio
      const shapeStyle = getShapeStyles(selectedShape)
      const aspectRatioStr = shapeStyle.aspectRatio as string
      const [widthRatio, heightRatio] = aspectRatioStr.split('/').map(Number)

      // Calculate the draggable item dimensions based on the shape
      let itemWidth, itemHeight

      // Base width is 30% of container width * scale
      const baseWidth = containerWidth * 0.3 * padScale

      if (selectedShape === 'landscape') {
        itemWidth = baseWidth
        itemHeight = baseWidth * (heightRatio / widthRatio)
      } else if (selectedShape === 'portrait') {
        itemWidth = baseWidth
        itemHeight = baseWidth * (heightRatio / widthRatio)
      } else if (selectedShape === 'square' || selectedShape === 'circle') {
        itemWidth = baseWidth
        itemHeight = baseWidth
      } else {
        // Default to landscape
        itemWidth = baseWidth
        itemHeight = baseWidth * (10 / 16)
      }

      // Adjust positions to account for draggable item center
      const halfItemWidth = itemWidth / 2
      const halfItemHeight = itemHeight / 2

      const points = [
        // Corners
        { x: padding + halfItemWidth, y: padding + halfItemHeight }, // top-left
        {
          x: containerWidth - padding - halfItemWidth,
          y: padding + halfItemHeight,
        }, // top-right
        {
          x: padding + halfItemWidth,
          y: containerHeight - padding - halfItemHeight,
        }, // bottom-left
        {
          x: containerWidth - padding - halfItemWidth,
          y: containerHeight - padding - halfItemHeight,
        }, // bottom-right
        // Sides
        { x: containerWidth / 2, y: padding + halfItemHeight }, // top
        {
          x: containerWidth / 2,
          y: containerHeight - padding - halfItemHeight,
        }, // bottom
        { x: padding + halfItemWidth, y: containerHeight / 2 }, // left
        { x: containerWidth - padding - halfItemWidth, y: containerHeight / 2 }, // right
      ].map((point) => ({
        x: point.x - halfItemWidth,
        y: point.y - halfItemHeight,
      }))

      setSnapPoints(points)
    }

    updateSnapPoints()
    window.addEventListener('resize', updateSnapPoints)
    return () => window.removeEventListener('resize', updateSnapPoints)
  }, [scale, padding, selectedShape, padScale])

  return (
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
              opacity: 1,
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
  )
}

function EditPanel() {
  const [scale, setScale] = useAtom(scaleAtom)
  const [padding, setPadding] = useAtom(paddingAtom)
  const [selectedShape, setSelectedShape] = useAtom(selectedShapeAtom)
  const [multipleElements, setMultipleElements] = useAtom(multipleElementsAtom)
  const [isDragging] = useAtom(isDraggingAtom)
  const [isCommandPressed] = useAtom(isCommandPressedAtom)

  return (
    <div>
      <DraggablePad />
      <div className={styles.shapeSelector}>
        <p>Shape:</p>
        <div className={styles.radioGroup}>
          {shapes.map((shape) => (
            <label
              className={styles.radioLabel}
              data-disabled={multipleElements}
              key={shape}
            >
              <input
                type="radio"
                name="shape"
                disabled={multipleElements}
                value={shape}
                checked={selectedShape === shape}
                onChange={() => setSelectedShape(shape)}
              />
              {shape}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.scaleControl}>
        <p>Padding: {padding.toFixed(2)}</p>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            className={styles.slider}
            value={padding}
            onChange={(e) => setPadding(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.scaleControl}>
        <p>Scale: {scale.toFixed(2)}</p>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0.4"
            max="3"
            step="0.01"
            className={styles.slider}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.multipleElements}>
        <input
          type="checkbox"
          id="multipleElements"
          checked={multipleElements}
          onChange={(e) => {
            const checked = e.target.checked
            setMultipleElements(checked)
            if (checked) {
              setSelectedShape('landscape')
            }
          }}
        />
        <label htmlFor="multipleElements">Multiple elements</label>
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
  )
}

function Canvas() {
  const [scale] = useAtom(scaleAtom)
  const [padding] = useAtom(paddingAtom)
  const [selectedShape] = useAtom(selectedShapeAtom)
  const [multipleElements] = useAtom(multipleElementsAtom)
  const [isDragging] = useAtom(isDraggingAtom)
  const [closestSnapPointIndex] = useAtom(closestSnapPointIndexAtom)
  const [snappedPointIndex] = useAtom(snappedPointIndexAtom)

  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasMeasureRef, canvasDimensions] = useMeasure()
  const [canvasElementMeasureRef, canvasElementDimensions] = useMeasure()
  const setCanvasDimensions = useSetAtom(canvasDimensionsAtom)
  const setCanvasElementDimensions = useSetAtom(canvasElementDimensionsAtom)
  const [position] = useAtom(canvasPositionAtom)

  useEffect(() => {
    setCanvasDimensions(canvasDimensions)
  }, [canvasDimensions])

  useEffect(() => {
    setCanvasElementDimensions(canvasElementDimensions)
  }, [canvasElementDimensions])

  return (
    <>
      <div
        className={styles.canvas}
        ref={mergeRefs([canvasContainerRef, canvasMeasureRef])}
      >
        <CanvasElement
          ref={canvasElementMeasureRef}
          shape={selectedShape}
          multiple={multipleElements}
          snapIndex={isDragging ? closestSnapPointIndex : snappedPointIndex}
          scale={scale}
          style={{
            x: position.x ?? 0,
            y: position.y ?? 0,
            ...getShapeStyles(selectedShape),
          }}
          animate={{
            width: `calc(${
              selectedShape === 'portrait' ? 20 : 30
            } * ${scale}% - ${padding * 2}px)`,
          }}
        />
      </div>
    </>
  )
}
