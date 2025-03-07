'use client'

import {
  motion,
  MotionStyle,
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
  useMemo,
  useLayoutEffect,
} from 'react'
import styles from './page.module.scss'
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'
import { atom, useAtom, useSetAtom, useAtomValue } from 'jotai'

// Define shape types
const shapes = ['landscape', 'portrait', 'square', 'circle'] as const
type Shape = (typeof shapes)[number]

// Add atom for background image
const backgroundImageAtom = atom<string | null>(null)

// Derived atom for whether a background image exists
const hasBackgroundImageAtom = atom((get) => get(backgroundImageAtom) !== null)

export default function LocationPad() {
  const [scale, setScale] = useState(0.75)
  const [padding, setPadding] = useState(5)
  const [backgroundImage, setBackgroundImage] = useAtom(backgroundImageAtom)
  const hasBackgroundImage = useAtomValue(hasBackgroundImageAtom)
  const [dragOver, setDragOver] = useState(false)

  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasMeasureRef, canvasDimensions] = useMeasure()

  const padContainerRef = useRef<HTMLDivElement>(null)
  const [padMeasureRef, padDimensions] = useMeasure()

  const draggableItemRef = useRef<HTMLDivElement>(null)
  const [draggableItemMeasureRef, draggableItemDimensions] = useMeasure()

  const animationControls = useAnimation()

  // Add state for shape selection
  const [selectedShape, setSelectedShape] = useState<Shape>('landscape')
  const [canvasElementMeasureRef, canvasElementDimensions] = useMeasure()

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

  // Add state to track the currently snapped point index
  const [snappedPointIndex, setSnappedPointIndex] = useState<number | null>(
    null,
  )

  // Add state to track the last manually snapped position
  const [lastManualSnapPosition, setLastManualSnapPosition] = useState<{
    index: number | null
    x: number
    y: number
  } | null>(null)

  const getPadMaxScale = () => {
    switch (selectedShape) {
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

  // Calculate the pad scale value
  const maxScale = getPadMaxScale()
  const pastMaxScale = scale > maxScale

  // Transform pad coordinates to canvas coordinates using dynamic dimensions
  const canvasX = useTransform(
    normalizedX,
    [0, 1],
    [padding, canvasDimensions.width - canvasElementDimensions.width - padding],
    {
      clamp: false,
    },
  )
  const canvasY = useTransform(
    normalizedY,
    [0, 1],
    [
      padding,
      canvasDimensions.height - canvasElementDimensions.height - padding,
    ],
    {
      clamp: false,
    },
  )

  // Helper function to get shape-specific styles
  const getShapeStyles = (shape: Shape) => {
    switch (shape) {
      case 'landscape':
        return { aspectRatio: '16/10', borderRadius: '0.3rem' }
      case 'portrait':
        return { aspectRatio: '10/16', borderRadius: '0.3rem' }
      case 'square':
        return { aspectRatio: '1/1', borderRadius: '0.3rem' }
      case 'circle':
        return { aspectRatio: '1/1', borderRadius: '50%' }
      default:
        return { aspectRatio: '16/10', borderRadius: '0.3rem' }
    }
  }

  // Calculate snap points based on container size
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
      const baseWidth = containerWidth * 0.3 * scale

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
  }, [scale, padding, selectedShape, scale])

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
    if (isCommandPressed) {
      // If command is pressed, don't snap and clear the snapped point index
      setSnappedPointIndex(null)
      return
    }

    setIsDragging(false)

    const draggable = draggableItemRef.current
    if (!draggable) return

    // Get current position
    const currentX = x.get()
    const currentY = y.get()

    // Find closest snap point
    const snapPoint = getClosestSnapPoint(currentX, currentY)
    // Get the index of the closest snap point
    const snapIndex = getClosestSnapPointIndex(currentX, currentY)

    // Reset closest snap point highlight
    setClosestSnapPointIndex(null)
    // Set the currently snapped point index
    setSnappedPointIndex(snapIndex)

    // Save the manually snapped position
    setLastManualSnapPosition({
      index: snapIndex,
      x: snapPoint.x,
      y: snapPoint.y,
    })

    // Animate to snap point
    animationControls.start({
      x: snapPoint.x,
      y: snapPoint.y,
    })
  }

  function handleDragStart() {
    setIsDragging(true)
  }

  function handleSnapPointClick(point: { x: number; y: number }) {
    if (isCommandPressed) return

    // Find the index of the clicked point
    const clickedIndex = snapPoints.findIndex(
      (p) => p.x === point.x && p.y === point.y,
    )

    // If this is the currently snapped point, do nothing
    if (clickedIndex === snappedPointIndex) {
      return
    }

    // Save the manually snapped position
    setLastManualSnapPosition({
      index: clickedIndex,
      x: point.x,
      y: point.y,
    })

    // Otherwise, proceed with the original behavior
    animationControls.start({
      x: point.x,
      y: point.y,
      transition,
    })

    // Update the snapped point index
    setSnappedPointIndex(clickedIndex)
  }

  useEffect(() => {
    // Only apply snap if we have a last manual snap position
    if (lastManualSnapPosition) {
      // If we have snap points and a valid last position, find the closest snap point
      if (snapPoints.length > 0) {
        // Find the closest snap point to the last manual position
        const closestPoint = getClosestSnapPoint(
          lastManualSnapPosition.x,
          lastManualSnapPosition.y,
        )
        const closestIndex = getClosestSnapPointIndex(
          lastManualSnapPosition.x,
          lastManualSnapPosition.y,
        )

        // Animate to the closest snap point
        animationControls.start({
          x: closestPoint.x,
          y: closestPoint.y,
          transition,
        })

        // Update the snapped point index
        setSnappedPointIndex(closestIndex)
      }
    }
  }, [scale, padding])

  // Effect to reposition the draggable item when the shape changes
  useEffect(() => {
    // Only run if we have snap points and a last manual snap position
    if (snapPoints.length > 0 && lastManualSnapPosition) {
      // Find closest snap point after shape change
      const closestPoint = getClosestSnapPoint(
        lastManualSnapPosition.x,
        lastManualSnapPosition.y,
      )
      const closestIndex = getClosestSnapPointIndex(
        lastManualSnapPosition.x,
        lastManualSnapPosition.y,
      )

      // Animate to the closest snap point
      animationControls.start({
        x: closestPoint.x,
        y: closestPoint.y,
        transition,
      })

      // Update the snapped point index
      setSnappedPointIndex(closestIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShape, snapPoints.length])

  // When initializing the component, set the initial snapped point
  useEffect(() => {
    if (snapPoints.length > 0 && !lastManualSnapPosition) {
      // Set initial snapped point to the center or first point
      const initialIndex = 0 // Or whatever default you prefer
      setSnappedPointIndex(initialIndex)

      // Save this as the last manual snap position
      setLastManualSnapPosition({
        index: initialIndex,
        x: snapPoints[initialIndex].x,
        y: snapPoints[initialIndex].y,
      })

      // Set initial position to the snapped point
      animationControls.start({
        x: snapPoints[initialIndex].x,
        y: snapPoints[initialIndex].y,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapPoints.length])

  // Function to handle shape change
  const handleShapeChange = (shape: Shape) => {
    setSelectedShape(shape)
    // The snap points will be recalculated due to the dependency on selectedShape
    // in the updateSnapPoints useEffect
  }

  const [snapPointsOverlap, setSnapPointsOverlap] = useState(false)
  useLayoutEffect(() => {
    const checkForOverlap = (): boolean => {
      const parent = padContainerRef.current
      if (!parent) return false

      const snapPoints = parent.querySelectorAll('[data-snapoint="true"]')
      if (snapPoints.length === 0) return false

      const rects = Array.from(snapPoints)
        .map((snapPoint) => snapPoint.getBoundingClientRect())
        .map((rect) => ({
          ...rect,
          x: rect.x - 3,
          y: rect.y - 3,
          width: rect.width + 6,
          height: rect.height + 6,
        }))

      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const rect1 = rects[i]
          const rect2 = rects[j]

          const overlapX =
            Math.abs(rect1.x - rect2.x) < (rect1.width + rect2.width) / 2
          const overlapY =
            Math.abs(rect1.y - rect2.y) < (rect1.height + rect2.height) / 2

          if (overlapX && overlapY) {
            return true
          }
        }
      }

      return false
    }
    setSnapPointsOverlap(checkForOverlap())
  }, [padding, selectedShape, scale])

  const [multipleElements, setMultipleElements] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  const [snapShotKey, setSnapShotKey] = useState<null | string>(null)
  const [snapShotStyles, setSnapShotStyles] = useState<null | MotionStyle>(null)
  const canvasElementRef = useRef<HTMLDivElement>(null)
  function handleSnapshot() {
    if (!canvasElementRef.current) return
    setSnapShotKey(Math.random().toString(36).substring(2, 15))
    setSnapShotStyles({
      width: canvasElementDimensions.width,
      height: canvasElementDimensions.height,
      x: canvasX.get(),
      y: canvasY.get(),
    })
  }

  // Handle background image upload
  const handleBackgroundImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check if the file is an image
      if (file.type.match(/image.*/)) {
        const reader = new FileReader()

        reader.onload = (loadEvent) => {
          if (loadEvent.target?.result) {
            setBackgroundImage(loadEvent.target.result as string)
          }
        }

        reader.readAsDataURL(file)
      }

      // Clear the input value so the same file can be selected again
      e.target.value = ''
    }
  }

  const handleRemoveBackground = () => {
    setBackgroundImage(null)
  }

  // Handle drag and drop for background images
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Check if the file is an image
      if (file.type.match(/image.*/)) {
        const reader = new FileReader()

        reader.onload = (loadEvent) => {
          if (loadEvent.target?.result) {
            setBackgroundImage(loadEvent.target.result as string)
          }
        }

        reader.readAsDataURL(file)
      }
    }
  }

  // Handle paste events for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        const items = e.clipboardData.items

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile()

            if (blob) {
              const reader = new FileReader()

              reader.onload = (loadEvent) => {
                if (loadEvent.target?.result) {
                  setBackgroundImage(loadEvent.target.result as string)
                }
              }

              reader.readAsDataURL(blob)
              break
            }
          }
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [setBackgroundImage])

  return (
    <div className={styles.container}>
      {/* Canvas */}
      <div
        className={`${styles.canvas} ${dragOver ? styles.dragOver : ''}`}
        ref={mergeRefs([canvasContainerRef, canvasMeasureRef])}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {snapShotStyles && (
          <motion.div
            key={snapShotKey}
            style={{
              ...snapShotStyles,
              backgroundColor: '#22c55e',
              border: '1px solid #22c55e',
              position: 'absolute',
              borderRadius: '0.5rem',
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          />
        )}
        <CanvasElement
          ref={mergeRefs([canvasElementRef, canvasElementMeasureRef])}
          shape={selectedShape}
          multiple={multipleElements}
          scale={scale}
          snapIndex={isDragging ? closestSnapPointIndex : snappedPointIndex}
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

        {/* Drag overlay - moved inside the canvas div */}
        {dragOver && (
          <div className={styles.dragOverlay}>
            <p>Drop image to set as background</p>
          </div>
        )}
      </div>

      {/* Suidepanel */}
      <div>
        {/* Debug */}
        {debugMode && (
          <Debug normalizedX={normalizedX} normalizedY={normalizedY} />
        )}

        {/* Pad container */}
        <div
          ref={mergeRefs([padContainerRef, padMeasureRef])}
          className={styles.constraintsArea}
          style={{
            maxWidth: 200,
          }}
        >
          {snapPoints.map((point, index) => (
            <motion.div
              key={index}
              data-snapoint="true"
              data-snapoint-overlap={snapPointsOverlap}
              animate={{
                opacity: !isCommandPressed ? 1 : 0,
              }}
              className={`${styles.snapPoint} ${
                index === closestSnapPointIndex ? styles.snapPointActive : ''
              } ${index === snappedPointIndex ? styles.snapPointSnapped : ''}`}
              style={{
                transform: `translate(${point.x}px, ${point.y}px)`,
                position: 'absolute',
                width: 30 * scale + '%',
                pointerEvents: index === snappedPointIndex ? 'none' : 'auto',
                ...getShapeStyles(selectedShape),
              }}
              onClick={() => handleSnapPointClick(point)}
            >
              <motion.span
                initial={false}
                animate={{
                  opacity: debugMode ? 1 : 0,
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
              width: 30 * scale + '%',
              zIndex: 999,
              ...getShapeStyles(selectedShape),
            }}
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
                  onChange={() => handleShapeChange(shape)}
                />
                {shape}
              </label>
            ))}
          </div>
        </div>

        {/* Padding slider */}
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

        {/* Scale slider */}
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

        {/* Multiple elements */}
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

        {/* Button controls */}
        <div className={styles.buttonControls}>
          <button
            disabled={multipleElements || selectedShape !== 'landscape'}
            className={styles.snapshotButton}
            onClick={handleSnapshot}
          >
            Snapshot current position
          </button>
          {backgroundImage && (
            <button onClick={handleRemoveBackground}>Remove Background</button>
          )}
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

type CanvasElementProps = ComponentProps<typeof motion.div> & {
  shape?: Shape
  multiple?: boolean
  snapIndex: number | null
  scale: number
}

function CanvasElement(props: CanvasElementProps) {
  const getStyles = (): CSSProperties => {
    switch (props.snapIndex) {
      case 0:
      case 2:
        return {
          flexDirection: 'row',
        }
      case 6:
      case 7:
        return {
          flexDirection: 'column',
        }
      case 1:
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
        className={styles.ghostContainer}
        style={finalStyles}
      >
        <motion.div
          layout
          transition={transition}
          className={styles.movableElement}
        />
        {props.scale <= 1.4 && (
          <motion.div
            layout
            transition={transition}
            className={styles.ghostElement}
          />
        )}
        {props.scale <= 1 && (
          <motion.div
            layout
            transition={transition}
            className={styles.ghostElement}
          />
        )}
      </motion.div>
    )
  }
  return <motion.div {...props} className={styles.movableElement} />
}

const slowmo = { duration: 2 } satisfies ValueAnimationTransition
const bouncy = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 1,
} satisfies ValueAnimationTransition
const smooth = {
  type: 'spring',
  stiffness: 500,
  damping: 60,
  mass: 1,
} satisfies ValueAnimationTransition
const snappy = {
  type: 'spring',
  stiffness: 1000,
  damping: 20,
  mass: 0.01,
} satisfies ValueAnimationTransition

const transition = bouncy
