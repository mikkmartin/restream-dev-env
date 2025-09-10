'use client'

import { cn } from '@/app/utils/utils'
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import styles from './page.module.scss'
import { useOnClickOutside } from 'usehooks-ts'

export default function LayoutEditor2() {
  const [containerHovered, setContainerHovered] = useState(false)
  const [selected, setSelected] = useState(false)

  const elRef = useRef<HTMLDivElement>(null)
  //@ts-ignore
  useOnClickOutside(elRef, () => setSelected(false))

  return (
    <div
      onMouseEnter={() => setContainerHovered(true)}
      onMouseLeave={() => setContainerHovered(false)}
      className="w-full aspect-[16/9] overflow-hidden bg-slate-900/30 rounded-2xl relative"
    >
      <motion.div
        ref={elRef}
        onClick={() => setSelected(true)}
        className={cn([
          'absolute top-1/2 left-1/2 text-white text-9xl font-bold',
          selected && 'bg-amber-200/80',
        ])}
        style={{
          x: '-50%',
          y: '-50%',
        }}
      >
        08:00
        <motion.div
          initial="initial"
          whileHover="hover"
          variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }}
          className="absolute inset-0 bg-amber-200/20"
        />
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial="initial"
            animate={[containerHovered ? 'hover' : '']}
            variants={{
              initial: {
                opacity: 0,
              },
              hover: {
                opacity: 1,
                x: i === 0 || i === 3 ? '-80%' : i === 1 || i === 2 ? '80%' : 0,
                y: i === 0 || i === 1 ? '-80%' : i === 2 || i === 3 ? '80%' : 0,
              },
            }}
            className={cn([
              'absolute size-8 bg-red-200/20',
              i === 0 && 'top-0 left-0',
              i === 1 && 'right-0 top-0',
              i === 2 && 'bottom-0 right-0',
              i === 3 && 'bottom-0 left-0',
            ])}
          />
        ))}
      </motion.div>
    </div>
  )
}
