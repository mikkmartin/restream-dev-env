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
    height: 225,
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
          <span>10:00</span>
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
