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
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'

export default function LocationPad() {
  const x = useMotionValue(0) //normalised x position
  const y = useMotionValue(0) //normalised y position

  const [size, setSize] = useState(0)
  const [padRef, padBounds] = useMeasure()
  const [dragElementRef, dragElementBounds] = useMeasure()


  return (
    <div className='w-full h-full flex items-start gap-4'>
      <div className='flex-1/2 aspect-[16/9] bg-red-500'>

      </div>
      <div className='flex-1'>
        <div className='w-full aspect-[16/9] bg-blue-500/10 overflow-clip' ref={padRef}>
          <motion.div
            className='w-1/3 h-1/3 bg-green-500 cursor-grab active:cursor-grabbing'
            onDrag={(e, info) => {
              const el = e.target as HTMLDivElement
              const elBounds = el.getBoundingClientRect()

              //calculate normalised x and y
              const normalizedX = (elBounds.x - padBounds.x) / (padBounds.width - el.offsetWidth)
              const normalizedY = (elBounds.y - padBounds.y) / (padBounds.height - el.offsetHeight)

              x.set(normalizedX)
              y.set(normalizedY)

            }}
            ref={dragElementRef}
            drag
          />
        </div>
        <div className='flex flex-col gap-2'>
          <p>Size: <motion.span>{size}</motion.span></p>
          <input type='range' min={.2} max={1} step={0.01} value={size} onChange={(e) => setSize(e.target.valueAsNumber)} />
        </div>
        <div>
          <p>x: <motion.span>{x}</motion.span></p>
          <p>y: <motion.span>{y}</motion.span></p>
        </div>
      </div>
    </div>
  )
}
