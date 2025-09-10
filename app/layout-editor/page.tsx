'use client'

import { cn } from '@/app/utils/utils'
import { motion, ValueAnimationTransition } from 'framer-motion'
import { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

export default function LayoutEditor2() {
  const [editMode, setEditMode] = useState(false)
  const [containerHovered, setContainerHovered] = useState(false)
  const [selected, setSelected] = useState(false)

  const elRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  //@ts-ignore
  useOnClickOutside(elRef, () => setSelected(false))

  return (
    <div className="flex flex-col w-full gap-1">
      <div
        ref={containerRef}
        onMouseEnter={() => setContainerHovered(true)}
        onMouseLeave={() => setContainerHovered(false)}
        className={cn([
          'w-full aspect-[16/9] overflow-hidden bg-slate-900 rounded-xl relative outline-4 outline-transparent',
          editMode && 'outline-blue-500',
        ])}
      >
        <motion.div
          ref={elRef}
          onClick={() => setSelected(true)}
          className={cn([
            'absolute top-1/2 left-1/2 text-white text-9xl font-bold rounded-xl flex flex-col gap-2 px-4 py-2',
            editMode && 'cursor-grab active:cursor-grabbing',
          ])}
          drag
          dragConstraints={containerRef}
          dragMomentum={false}
          style={{
            x: '-50%',
            y: '-50%',
          }}
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
              'absolute inset-0 rounded-2xl',
              containerHovered &&
                !selected &&
                'bg-white/10 hover:outline-2 outline-white/60',
              selected &&
                'bg-white/10 hover:bg-white/20 hover:outline-2 outline-white/60',
            )}
          />
          {Array.from({ length: 4 }).map((_, i) => (
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
                rotate: i === 0 ? 0 : i === 1 ? 90 : i === 2 ? 180 : 270,
              }}
              whileHover="selfHovered"
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
                  opacity: 0.1,
                  x:
                    i === 0 || i === 3
                      ? '-45%'
                      : i === 1 || i === 2
                        ? '45%'
                        : 0,
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
                'absolute size-8 cursor-nesw-resize',
                i === 0 && 'top-0 left-0 cursor-nwse-resize',
                i === 1 && 'right-0 top-0',
                i === 2 && 'bottom-0 right-0 cursor-nwse-resize',
                i === 3 && 'bottom-0 left-0',
              ])}
            >
              <path
                d="M41 4H40C20.1178 4 4 20.1177 4 40V41"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </motion.svg>
          ))}
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
