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

const noClampOption = {
  clamp: false
}

export default function LocationPad() {
  const x = useMotionValue(0) //normalised x position
  const y = useMotionValue(0) //normalised y position

  const [size, setSize] = useState(0.2)

  const [padRef, padBounds] = useMeasure()
  const [dragElementRef, dragElementBounds] = useMeasure()

  const [canvasElementRef, canvasElementBounds] = useMeasure()
  const [canvasRef, canvasBounds] = useMeasure()

  return (
    <div className='w-full h-full flex items-start gap-4'>
      <div className='flex-1/2 aspect-[16/9] overflow-clip' ref={canvasRef}>
        <motion.div className='aspect-[16/9] bg-red-500' ref={canvasElementRef} style={{
          x: useTransform(x, [0, 1], [0, canvasBounds.width - canvasElementBounds.width], noClampOption),
          y: useTransform(y, [0, 1], [0, canvasBounds.height - canvasElementBounds.height], noClampOption),
          width: `${size * 100}%`,
        }} />
      </div>
      <div className='flex-1'>
        <div className='w-full aspect-[16/9] bg-blue-500/10 overflow-clip' ref={padRef}>
          <motion.div
            className='aspect-[16/9] bg-green-500 cursor-grab active:cursor-grabbing'
            dragMomentum={false}
            dragConstraints={{
              top: -dragElementBounds.height + 24,
              left: -dragElementBounds.width + 24,
              bottom: padBounds.height - 24,
              right: padBounds.width - 24,
            }}
            onDrag={(e) => {
              const el = e.target as HTMLDivElement
              const elBounds = el.getBoundingClientRect()

              const normalizedX = (elBounds.x - padBounds.x) / (padBounds.width - el.offsetWidth)
              const normalizedY = (elBounds.y - padBounds.y) / (padBounds.height - el.offsetHeight)

              x.set(normalizedX)
              y.set(normalizedY)

            }}
            style={{
              width: `${size * 100}%`,
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
