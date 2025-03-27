'use client'

import {
  motion,
  MotionConfig,
  useMotionValue,
  useTransform,
  ValueAnimationTransition,
} from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import useMeasure from 'react-use-measure'
import { atom, useAtom, useSetAtom } from 'jotai'
import { transform } from 'motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  CornerTopLeft,
  EdgeTop,
  Center
} from './icons'

const noClampOption = {
  clamp: false
}

const snapIndexAtom = atom(0)
const isSnappedAtom = atom(true)

export default function LocationPad() {
  const setSnapIndex = useSetAtom(snapIndexAtom)
  const [isSnapped, setIsSnapped] = useAtom(isSnappedAtom)
  const [padding, setPadding] = useState(0)

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

  const padX = transform(elementX, [0, 1], [0, padBounds.width - dragElementBounds.width], noClampOption)
  const padY = transform(elementY, [0, 1], [0, padBounds.height - dragElementBounds.height], noClampOption)

  // Calculate padding in pixels based on the canvas size
  const paddingPixels = Math.round(padding * canvasBounds.width)

  useEffect(() => {
    if (!isSnapped) {
      setTimeout(() => {
        setSize(p => p >= 1 ? 1 : p + 0.001)
      }, 30)
    }
  }, [isSnapped])

  return (
    <MotionConfig transition={snappy}>
      <div className='w-full h-full flex items-start gap-4 font-mono text-xs'>
        <div className='flex-1/2 aspect-[16/9] overflow-clip bg-white/20 rounded-2xl' ref={canvasRef}>
          <motion.div
            className='aspect-[16/9] border-4 border-red-500 rounded-2xl bg-red-500/10'
            ref={canvasElementRef}
            animate={{
              x: transform(elementX, [0, 1], [
                isSnapped ? paddingPixels : 0,
                isSnapped ? canvasBounds.width - canvasElementBounds.width - paddingPixels : canvasBounds.width - canvasElementBounds.width
              ], noClampOption),
              y: transform(elementY, [0, 1], [
                isSnapped ? paddingPixels : 0,
                isSnapped ? canvasBounds.height - canvasElementBounds.height - paddingPixels : canvasBounds.height - canvasElementBounds.height
              ], noClampOption),
              width: `${size * 100}%`,
            }}
          />
        </div>
        <div className='flex-1 flex flex-col gap-4 min-w-[300px] bg-[#182B4E] !p-6 rounded-2xl'>
          <div className='flex flex-row gap-2'>
            <p className="flex-1/2">Position:</p>
            {isSnapped ?
              <AlignPad
                setPosition={(_x, _y) => {
                  x.set(_x)
                  y.set(_y)
                }} />
              :
              <div className='w-full aspect-[16/9] bg-[#081E42] overflow-clip' ref={padRef}>
                <motion.div
                  layoutId='pad'
                  ref={dragElementRef}
                  className='aspect-[16/9] bg-white/40 rounded-sm cursor-grab active:cursor-grabbing'
                  animate={{
                    x: padX,
                    y: padY,
                  }}
                  style={{
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
          </div>
          <div className='flex flex-row gap-2 mt-4'>
            <p className='flex-1/2'>Snapped:</p>
            <input className="h-8 aspect-square" type='checkbox' checked={isSnapped} onChange={(e) => {
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
          <div className='flex flex-row gap-2 mt-4'>
            <p className='flex-1/2'>Size: {(size * 100).toFixed(2)}%</p>
            <input className='w-full' type='range' min={.2} max={1} step={0.01} value={size} onChange={(e) => setSize(e.target.valueAsNumber)} />
          </div>
          <div className='flex flex-row gap-2 mt-4'>
            <p className={cn('flex-1/2', !isSnapped && 'opacity-50')}>Padding: {(padding * 100).toFixed(0)}%</p>
            <input
              className={cn('w-full', !isSnapped && 'opacity-20')}
              type='range'
              min={0}
              max={0.05}
              step={0.01}
              value={padding}
              onChange={(e) => setPadding(e.target.valueAsNumber)}
              disabled={!isSnapped}
            />
          </div>
          {/* <div>
            <p>x: <motion.span className="absolute">{x}</motion.span></p>
            <p>y: <motion.span className="absolute">{y}</motion.span></p>
          </div> */}
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

  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <CornerTopLeft />
      case 1:
        return <EdgeTop />
      case 2:
        return <CornerTopLeft className='scale-x-[-1]' />
      case 3:
        return <EdgeTop className='-rotate-90' />
      case 4:
        return <Center />
      case 5:
        return <EdgeTop className='rotate-90' />
      case 6:
        return <CornerTopLeft className='scale-y-[-1]' />
      case 7:
        return <EdgeTop className='scale-y-[-1]' />
      case 8:
        return <CornerTopLeft className='scale-y-[-1] scale-x-[-1]' />
      default:
        return null
    }
  }

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
    <div className="w-full aspect-[16/9] bg-[#081E42] overflow-clip grid grid-cols-3 grid-rows-3 gap-1 !p-1 rounded-md">
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'relative hover:bg-white/20 rounded-xs flex items-center justify-center opacity-30 hover:text-white',
            snapIndex === i && 'opacity-100'
          )}
          onClick={() => handleClick(i)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {getIcon(i)}
          </div>
          {snapIndex === i && (
            <motion.div
              layoutId="pad"
              className='absolute inset-0 bg-white/40 rounded-xs'
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const slowmo = { duration: 2 } satisfies ValueAnimationTransition
const bouncy = { type: 'spring', stiffness: 500, damping: 25, mass: 1 } satisfies ValueAnimationTransition
const smooth = { type: 'spring', stiffness: 500, damping: 60, mass: 1 } satisfies ValueAnimationTransition
const snappy = { type: 'spring', stiffness: 1000, damping: 20, mass: 0.01 } satisfies ValueAnimationTransition