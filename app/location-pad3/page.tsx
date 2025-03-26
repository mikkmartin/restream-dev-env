'use client'

import {
  motion,
  MotionConfig,
  useAnimation,
  useMotionValue,
  useTransform,
  ValueAnimationTransition,
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
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'
import { atom, useAtom, useSetAtom } from 'jotai'
import { transform } from 'motion'
const noClampOption = {
  clamp: false
}

const snapIndexAtom = atom(0)
const isSnappedAtom = atom(false)

export default function LocationPad() {
  const setSnapIndex = useSetAtom(snapIndexAtom)
  const [isSnapped, setIsSnapped] = useAtom(isSnappedAtom)

  const x = useMotionValue(0) //normalised x position
  const y = useMotionValue(0) //normalised y position

  const [size, setSize] = useState(0.2)

  const [padRef, padBounds] = useMeasure()
  const [dragElementRef, dragElementBounds] = useMeasure()

  const [canvasElementRef, canvasElementBounds] = useMeasure()
  const [canvasRef, canvasBounds] = useMeasure()



  const elOffsetRef = useRef({ x: 0, y: 0 })

  const [elementX, setElementX] = useState(0)
  const [elementY, setElementY] = useState(0)

  useEffect(() => {
    x.on('change', setElementX)
    y.on('change', setElementY)
  }, [x, y])

  const padX = useTransform(x, [0, 1], [0, padBounds.width - dragElementBounds.width], noClampOption)
  const padY = useTransform(y, [0, 1], [0, padBounds.height - dragElementBounds.height], noClampOption)

  return (
    <MotionConfig transition={snappy}>
      <div className='w-full h-full flex items-start gap-4'>
        <div className='flex-1/2 aspect-[16/9] overflow-clip bg-white/20' ref={canvasRef}>
          <motion.div
            className='aspect-[16/9] bg-red-500'
            ref={canvasElementRef}
            style={{
            }}
            animate={{
              x: transform(elementX, [0, 1], [0, canvasBounds.width - canvasElementBounds.width], noClampOption),
              y: transform(elementY, [0, 1], [0, canvasBounds.height - canvasElementBounds.height], noClampOption),
              width: `${size * 100}%`,
            }}
          />
        </div>
        <div className='flex-1'>
          {isSnapped ?
            <AlignPad
              setPosition={(_x, _y) => {
                x.set(_x)
                y.set(_y)
              }} />
            :
            <div className='w-full aspect-[16/9] bg-blue-500/10 overflow-clip' ref={padRef}>
              <motion.div
                layoutId='pad'
                ref={dragElementRef}
                className='aspect-[16/9] bg-green-500 cursor-grab active:cursor-grabbing'
                style={{
                  x: padX,
                  y: padY,
                  width: `${size * 100}%`,
                }}
                // drag
                // dragMomentum={false}
                // dragConstraints={{
                //   top: -dragElementBounds.height + 24,
                //   left: -dragElementBounds.width + 24,
                //   bottom: padBounds.height - 24,
                //   right: padBounds.width - 24,
                // }}
                onTapStart={(e) => {
                  const el = e.target as HTMLDivElement
                  const elBounds = el.getBoundingClientRect()
                  //@ts-ignore
                  const offset = { x: e.clientX - elBounds.x, y: e.clientY - elBounds.y }
                  elOffsetRef.current = offset
                }}
                onPan={(e, info) => {
                  const offset = elOffsetRef.current

                  const _x = info.point.x - offset.x - padBounds.left
                  const _y = info.point.y - offset.y - padBounds.top

                  const normalizedX = _x / (padBounds.width - dragElementBounds.width)
                  const normalizedY = _y / (padBounds.height - dragElementBounds.height)

                  x.set(normalizedX)
                  y.set(normalizedY)
                }}
              />
            </div>}
          <div className='flex flex-col gap-2'>
            <p>Size: <motion.span>{size}</motion.span></p>
            <input type='range' min={.2} max={1} step={0.01} value={size} onChange={(e) => setSize(e.target.valueAsNumber)} />
          </div>
          <div className='flex flex-col gap-2'>
            <p>Snapped:</p>
            <input type='checkbox' checked={isSnapped} onChange={(e) => {
              const isChecked = e.target.checked
              setIsSnapped(isChecked)
              if (isChecked) {
                //snap to nearest 0.5
                const normalizedX = Math.round(x.get() * 2) / 2
                const normalizedY = Math.round(y.get() * 2) / 2
                x.set(normalizedX)
                y.set(normalizedY)
                //set snap index based on nearest 0.5
                const snapIndex = posToIndex(normalizedX, normalizedY)
                setSnapIndex(snapIndex)
              }
            }} />
          </div>
          <div>
            <p>x: <motion.span className="absolute">{x}</motion.span></p>
            <p>y: <motion.span className="absolute">{y}</motion.span></p>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}

function posToIndex(x: number, y: number) {
  switch (true) {
    case x === 0 && y === 0:
      return 0
    case x === 0.5 && y === 0:
      return 1
    case x === 1 && y === 0:
      return 2
    case x === 0 && y === 0.5:
      return 3
    case x === 0.5 && y === 0.5:
      return 4
    case x === 1 && y === 0.5:
      return 5
    case x === 0 && y === 1:
      return 6
    case x === 0.5 && y === 1:
      return 7
    case x === 1 && y === 1:
      return 8
    default:
      return 4 // Default to center if no match is found
  }
}

function AlignPad({ setPosition }: { setPosition: (x: number, y: number) => void }) {
  const [snapIndex, setSnapIndex] = useAtom(snapIndexAtom)
  const [isSnapped] = useAtom(isSnappedAtom)

  function handleClick(index: number) {
    setSnapIndex(index)
    switch (index) {
      case 0:
        setPosition(0, 0)
        break
      case 1:
        setPosition(0.5, 0)
        break
      case 2:
        setPosition(1, 0)
        break
      case 3:
        setPosition(0, 0.5)
        break
      case 4:
        setPosition(0.5, 0.5)
        break
      case 5:
        setPosition(1, 0.5)
        break
      case 6:
        setPosition(0, 1)
        break
      case 7:
        setPosition(0.5, 1)
        break
      case 8:
        setPosition(1, 1)
        break
    }
  }

  return (
    <div className="w-full aspect-[16/9] bg-blue-500/10 overflow-clip grid grid-cols-3 grid-rows-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div key={i} className='bg-green-500/10 hover:bg-green-500/20 rounded-xs' onClick={() => handleClick(i)}>
          {snapIndex === i && <motion.div layoutId="pad" className='w-full h-full bg-green-500 rounded-xs' />}
        </motion.div>
      ))}
    </div>
  )
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const slowmo = { duration: 2 } satisfies ValueAnimationTransition
const bouncy = { type: 'spring', stiffness: 500, damping: 25, mass: 1 } satisfies ValueAnimationTransition
const smooth = { type: 'spring', stiffness: 500, damping: 60, mass: 1 } satisfies ValueAnimationTransition
const snappy = { type: 'spring', stiffness: 1000, damping: 20, mass: 0.01 } satisfies ValueAnimationTransition