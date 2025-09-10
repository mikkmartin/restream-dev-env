'use client'

import { cn } from '@/app/utils/utils'
import { motion, ValueAnimationTransition } from 'framer-motion'
import React, { useRef, useState, useCallback } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

interface PanelState {
  x: number
  y: number
  width: number
  height: number
}

interface DragState {
  isDragging: boolean
  isResizing: boolean
  resizeHandle: string | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startPanelX: number
  startPanelY: number
}

export default function LayoutEditor2() {
  const [editMode, setEditMode] = useState(false)
  const [containerHovered, setContainerHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  const [siblingHovered, setSiblingHovered] = useState(false)

  const elRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  //@ts-ignore
  useOnClickOutside(elRef, () => setSelected(false))

  // Panel state management
  const [panelState, setPanelState] = useState<PanelState>({
    x: 0,
    y: 0,
    width: 450,
    height: 150,
  })

  // Center the panel in the container
  React.useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = (rect.width - panelState.width) / 2
      const centerY = (rect.height - panelState.height) / 2

      setPanelState((prev) => ({
        ...prev,
        x: centerX,
        y: centerY,
      }))
    }
  }, [])

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startPanelX: 0,
    startPanelY: 0,
  })

  const aspectRatio = panelState.width / panelState.height

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle?: string) => {
      if (!editMode) return

      e.preventDefault()
      e.stopPropagation()

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const clientX = e.clientX - rect.left
      const clientY = e.clientY - rect.top

      if (handle) {
        // Resizing
        setDragState({
          isDragging: false,
          isResizing: true,
          resizeHandle: handle,
          startX: clientX,
          startY: clientY,
          startWidth: panelState.width,
          startHeight: panelState.height,
          startPanelX: panelState.x,
          startPanelY: panelState.y,
        })
      } else {
        // Dragging
        setDragState({
          isDragging: true,
          isResizing: false,
          resizeHandle: null,
          startX: clientX,
          startY: clientY,
          startWidth: panelState.width,
          startHeight: panelState.height,
          startPanelX: panelState.x,
          startPanelY: panelState.y,
        })
      }
    },
    [editMode, panelState],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!editMode || (!dragState.isDragging && !dragState.isResizing)) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const clientX = e.clientX - rect.left
      const clientY = e.clientY - rect.top

      const deltaX = clientX - dragState.startX
      const deltaY = clientY - dragState.startY

      if (dragState.isDragging) {
        // Handle dragging
        const newX = Math.max(
          0,
          Math.min(
            rect.width - panelState.width,
            dragState.startPanelX + deltaX,
          ),
        )
        const newY = Math.max(
          0,
          Math.min(
            rect.height - panelState.height,
            dragState.startPanelY + deltaY,
          ),
        )

        setPanelState((prev) => ({
          ...prev,
          x: newX,
          y: newY,
        }))
      } else if (dragState.isResizing && dragState.resizeHandle) {
        // Handle resizing with aspect ratio preservation
        let newWidth = dragState.startWidth
        let newHeight = dragState.startHeight
        let newX = dragState.startPanelX
        let newY = dragState.startPanelY

        switch (dragState.resizeHandle) {
          case 'se': // Southeast (bottom-right)
            // Use the larger delta for diagonal resize
            const seDelta =
              Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
            newWidth = Math.max(300, dragState.startWidth + seDelta)
            newHeight = newWidth / aspectRatio
            break
          case 'sw': // Southwest (bottom-left)
            // Use the larger delta for diagonal resize
            const swDelta =
              Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY
            newWidth = Math.max(300, dragState.startWidth + swDelta)
            newHeight = newWidth / aspectRatio
            newX = dragState.startPanelX + (dragState.startWidth - newWidth)
            break
          case 'ne': // Northeast (top-right)
            // Use the larger delta for diagonal resize
            const neDelta =
              Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : -deltaY
            newWidth = Math.max(300, dragState.startWidth + neDelta)
            newHeight = newWidth / aspectRatio
            newY = dragState.startPanelY + (dragState.startHeight - newHeight)
            break
          case 'nw': // Northwest (top-left)
            // Use the larger delta for diagonal resize
            const nwDelta =
              Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : -deltaY
            newWidth = Math.max(300, dragState.startWidth + nwDelta)
            newHeight = newWidth / aspectRatio
            newX = dragState.startPanelX + (dragState.startWidth - newWidth)
            newY = dragState.startPanelY + (dragState.startHeight - newHeight)
            break
        }

        // Constrain to container bounds
        const maxX = rect.width - newWidth
        const maxY = rect.height - newHeight

        newX = Math.max(0, Math.min(maxX, newX))
        newY = Math.max(0, Math.min(maxY, newY))

        setPanelState({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        })
      }
    },
    [editMode, dragState, panelState.width, panelState.height, aspectRatio],
  )

  const handleMouseUp = useCallback(() => {
    setDragState((prev) => ({
      ...prev,
      isDragging: false,
      isResizing: false,
      resizeHandle: null,
    }))
  }, [])

  // Add global mouse event listeners
  React.useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [
    dragState.isDragging,
    dragState.isResizing,
    handleMouseMove,
    handleMouseUp,
  ])

  return (
    <div className="flex flex-col w-full gap-1">
      <div
        ref={containerRef}
        onMouseEnter={() => setContainerHovered(true)}
        onMouseLeave={() => setContainerHovered(false)}
        className={cn([
          'w-full aspect-[16/9] overflow-hidden bg-slate-900 rounded-xl relative outline-4 outline-transparent',
          editMode && 'outline-blue-500',
          !editMode && 'pointer-events-none',
        ])}
      >
        <motion.div
          ref={elRef}
          onClick={() => setSelected(true)}
          className={cn([
            'absolute text-white text-9xl font-bold rounded-xl flex flex-col gap-2 px-4 py-2',
            editMode &&
              (dragState.isDragging ? 'cursor-grabbing' : 'cursor-grab'),
            dragState.isResizing && 'cursor-resizing',
          ])}
          style={{
            left: panelState.x,
            top: panelState.y,
            width: panelState.width,
            height: panelState.height,
          }}
          onMouseDown={(e) => handleMouseDown(e)}
        >
          <Timer />
          <motion.div
            initial="initial"
            whileHover="hover"
            animate={containerHovered ? 'containerHovered' : undefined}
            transition={smooth}
            variants={{
              initial: { opacity: 1 },
              hover: { opacity: 1 },
              selected: { opacity: 1 },
            }}
            className={cn(
              'absolute inset-0 rounded-2xl transition-all outline-2 outline-transparent',
              containerHovered &&
                !selected &&
                'bg-red-500/10 hover:outline-2 hover:outline-red-500/80',
              selected && 'bg-red-500/10 outline-red-500/40',
              selected &&
                !siblingHovered &&
                'bg-red-500/20 outline-red-500 outline-2',
            )}
          />
          {Array.from({ length: 4 }).map((_, i) => {
            const handleMap = ['nw', 'ne', 'sw', 'se']
            const handle = handleMap[i]

            return (
              <motion.svg
                key={i}
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                initial="initial"
                animate={[
                  // containerHovered ? 'containerHovered' : '',
                  selected ? 'selected' : '',
                ]}
                transition={transition}
                style={{
                  rotate: i === 0 ? 0 : i === 1 ? 90 : i === 2 ? 270 : 180,
                }}
                whileHover="selfHovered"
                onMouseEnter={() => setSiblingHovered(true)}
                onMouseLeave={() => setSiblingHovered(false)}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleMouseDown(e, handle)
                }}
                variants={{
                  initial: {
                    opacity: 0,
                    x:
                      i === 0 || i === 3
                        ? '-20%'
                        : i === 1 || i === 2
                          ? '20%'
                          : 0,
                    y:
                      i === 0 || i === 1
                        ? '-20%'
                        : i === 2 || i === 3
                          ? '20%'
                          : 0,
                  },
                  containerHovered: {
                    opacity: 0.25,
                    x:
                      i === 0 || i === 3
                        ? '-60%'
                        : i === 1 || i === 2
                          ? '60%'
                          : 0,
                    y:
                      i === 0 || i === 1
                        ? '-60%'
                        : i === 2 || i === 3
                          ? '60%'
                          : 0,
                  },
                  selected: {
                    opacity: 0.2,
                    x: i === 0 || i === 2 ? '-45%' : '45%',
                    y:
                      i === 0 || i === 1
                        ? '-45%'
                        : i === 2 || i === 3
                          ? '45%'
                          : 0,
                  },
                  selfHovered: {
                    opacity: 1,
                  },
                }}
                className={cn([
                  'absolute size-8 cursor-nesw-resize text-red-500',
                  i === 0 && 'top-0 left-0 cursor-nwse-resize',
                  i === 1 && 'right-0 top-0',
                  i === 2 && 'bottom-0 left-0',
                  i === 3 && 'bottom-0 right-0 cursor-nwse-resize',
                ])}
              >
                <motion.path
                  d="M41 4H40C20.1178 4 4 20.1177 4 40V41"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  // transition={bouncy}
                  // variants={{
                  //   initial: {
                  //     pathOffset: 0.5,
                  //     pathLength: 0,
                  //   },
                  //   selfHovered: {
                  //     pathOffset: 0,
                  //     pathLength: 0.9,
                  //   },
                  // }}
                />
              </motion.svg>
            )
          })}
        </motion.div>
      </div>
      <div
        className={cn(
          'flex flex-row justify-between w-full',
          editMode &&
            'bg-blue-500 outline-4 outline-blue-500 rounded-xl shadow-[0_-30px_0_4px_#2b7fff] p-1',
        )}
      >
        {editMode ? (
          <>
            <div className="flex gap-2">
              <Button>Undo</Button>
              <Button>Redo</Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditMode(!editMode)}>Cancel</Button>
              <Button
                className="bg-white text-blue-500"
                onClick={() => setEditMode(!editMode)}
              >
                Save
              </Button>
            </div>
          </>
        ) : (
          <Button className="ml-auto" onClick={() => setEditMode(!editMode)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}

function Button({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn('bg-blue-500 text-white px-4 py-2 rounded-md', className)}
    >
      {children}
    </button>
  )
}

function Timer() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="429"
      height="118"
      viewBox="0 0 429 118"
      fill="none"
      className="size-full"
    >
      <path
        d="M50.5502 1.83622V115H26.6245V24.5463H25.9614L0.0465088 40.7915V19.5733L28.0611 1.83622H50.5502Z"
        fill="white"
      />
      <path
        d="M121.816 117.486C112.312 117.45 104.134 115.11 97.2827 110.469C90.4678 105.827 85.2185 99.1046 81.5348 90.3006C77.888 81.4965 76.0829 70.9058 76.1198 58.5286C76.1198 46.1881 77.9432 35.6711 81.5901 26.9776C85.2738 18.284 90.5231 11.6717 97.338 7.14077C104.19 2.57297 112.349 0.289062 121.816 0.289062C131.283 0.289062 139.424 2.57297 146.239 7.14077C153.091 11.7086 158.359 18.3393 162.042 27.0328C165.726 35.6895 167.55 46.1881 167.513 58.5286C167.513 70.9427 165.671 81.5518 161.987 90.3558C158.34 99.1599 153.109 105.883 146.294 110.524C139.48 115.166 131.32 117.486 121.816 117.486ZM121.816 97.6496C128.3 97.6496 133.475 94.3895 137.343 87.8693C141.211 81.3492 143.126 71.5689 143.09 58.5286C143.09 49.9455 142.206 42.7991 140.437 37.0893C138.706 31.3796 136.238 27.0881 133.033 24.2148C129.865 21.3415 126.126 19.9048 121.816 19.9048C115.37 19.9048 110.213 23.1281 106.345 29.5746C102.477 36.0211 100.524 45.6724 100.488 58.5286C100.488 67.2221 101.353 74.479 103.085 80.2993C104.853 86.0827 107.339 90.4295 110.544 93.3396C113.749 96.2129 117.506 97.6496 121.816 97.6496Z"
        fill="white"
      />
      <path
        d="M198.553 101.849C194.906 101.849 191.775 100.56 189.159 97.9811C186.58 95.4025 185.291 92.2714 185.291 88.5876C185.291 84.9776 186.58 81.8833 189.159 79.3047C191.775 76.7261 194.906 75.4368 198.553 75.4368C202.089 75.4368 205.183 76.7261 207.836 79.3047C210.488 81.8833 211.814 84.9776 211.814 88.5876C211.814 91.0189 211.188 93.2475 209.935 95.2736C208.72 97.2628 207.117 98.8652 205.128 100.081C203.139 101.26 200.947 101.849 198.553 101.849ZM198.553 46.3171C194.906 46.3171 191.775 45.0278 189.159 42.4492C186.58 39.8706 185.291 36.7394 185.291 33.0557C185.291 29.4456 186.58 26.3697 189.159 23.828C191.775 21.2494 194.906 19.9601 198.553 19.9601C202.089 19.9601 205.183 21.2494 207.836 23.828C210.488 26.3697 211.814 29.4456 211.814 33.0557C211.814 35.5238 211.188 37.7708 209.935 39.7969C208.72 41.7861 207.117 43.3701 205.128 44.5489C203.139 45.7277 200.947 46.3171 198.553 46.3171Z"
        fill="white"
      />
      <path
        d="M275.289 117.486C265.785 117.45 257.607 115.11 250.755 110.469C243.94 105.827 238.691 99.1046 235.007 90.3006C231.361 81.4965 229.556 70.9058 229.592 58.5286C229.592 46.1881 231.416 35.6711 235.063 26.9776C238.746 18.284 243.996 11.6717 250.811 7.14077C257.662 2.57297 265.822 0.289062 275.289 0.289062C284.756 0.289062 292.897 2.57297 299.712 7.14077C306.564 11.7086 311.831 18.3393 315.515 27.0328C319.199 35.6895 321.022 46.1881 320.985 58.5286C320.985 70.9427 319.143 81.5518 315.46 90.3558C311.813 99.1599 306.582 105.883 299.767 110.524C292.952 115.166 284.793 117.486 275.289 117.486ZM275.289 97.6496C281.772 97.6496 286.948 94.3895 290.816 87.8693C294.684 81.3492 296.599 71.5689 296.562 58.5286C296.562 49.9455 295.678 42.7991 293.91 37.0893C292.179 31.3796 289.711 27.0881 286.506 24.2148C283.338 21.3415 279.599 19.9048 275.289 19.9048C268.842 19.9048 263.685 23.1281 259.817 29.5746C255.949 36.0211 253.997 45.6724 253.96 58.5286C253.96 67.2221 254.826 74.479 256.557 80.2993C258.325 86.0827 260.812 90.4295 264.017 93.3396C267.222 96.2129 270.979 97.6496 275.289 97.6496Z"
        fill="white"
      />
      <path
        d="M382.416 117.486C372.912 117.45 364.734 115.11 357.882 110.469C351.067 105.827 345.818 99.1046 342.134 90.3006C338.488 81.4965 336.683 70.9058 336.719 58.5286C336.719 46.1881 338.543 35.6711 342.19 26.9776C345.873 18.284 351.123 11.6717 357.938 7.14077C364.789 2.57297 372.949 0.289062 382.416 0.289062C391.883 0.289062 400.024 2.57297 406.839 7.14077C413.691 11.7086 418.958 18.3393 422.642 27.0328C426.326 35.6895 428.149 46.1881 428.112 58.5286C428.112 70.9427 426.27 81.5518 422.587 90.3558C418.94 99.1599 413.709 105.883 406.894 110.524C400.079 115.166 391.92 117.486 382.416 117.486ZM382.416 97.6496C388.899 97.6496 394.075 94.3895 397.943 87.8693C401.811 81.3492 403.726 71.5689 403.689 58.5286C403.689 49.9455 402.805 42.7991 401.037 37.0893C399.306 31.3796 396.838 27.0881 393.633 24.2148C390.465 21.3415 386.726 19.9048 382.416 19.9048C375.969 19.9048 370.812 23.1281 366.944 29.5746C363.076 36.0211 361.124 45.6724 361.087 58.5286C361.087 67.2221 361.953 74.479 363.684 80.2993C365.452 86.0827 367.939 90.4295 371.144 93.3396C374.349 96.2129 378.106 97.6496 382.416 97.6496Z"
        fill="white"
      />
    </svg>
  )
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

const transition = snappy
