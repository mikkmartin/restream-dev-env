'use client'

import { Root, Track, Range, Thumb } from "@radix-ui/react-slider";
import styles from './slider.module.scss'
import { clamp, motion, useMotionValue, useSpring, useTransform, ValueAnimationTransition } from 'framer-motion'
import { useRef } from "react";

const SliderDemo = () => (
  <form>
    <Slider />
  </form>
);

type SliderProps = {
  defaultValue?: number
  max?: number
  step?: number
}

export const slowmo = { duration: 2 } satisfies ValueAnimationTransition
export const bouncy = { type: 'spring', stiffness: 500, damping: 25, mass: 1 } satisfies ValueAnimationTransition
export const smooth = { type: 'spring', stiffness: 500, damping: 60, mass: 1 } satisfies ValueAnimationTransition
export const snappy = { type: 'spring', stiffness: 1600, damping: 100, mass: 0.5 } satisfies ValueAnimationTransition
const transition = snappy

function Slider({ defaultValue = 50, max = 100, step = 1 }: SliderProps) {
  const xNormalizedProgress = useMotionValue(0.5)
  const spring = useSpring(xNormalizedProgress, transition)

  return (
    <>
      <motion.span>{xNormalizedProgress}</motion.span>
      <MotionRoot
        className={styles.Root}
        defaultValue={[defaultValue]}
        max={max}
        step={step}
        style={{
          //x: useTransform(spring, (val: number) => val * 10),
          scaleX: useTransform(spring, (val: number) => val > 1 ? val : val < 0 ? 1 + -val : 1),
          scaleY: useTransform(spring, (val: number) => val > 1 ? 1 + 1 - val : val > 0 ? 1 : 1 + val),
          transformOrigin: useTransform(spring, (val: number) => val > 0.5 ? 'left' : 'right'),
        }}
        onValueChange={(value) => xNormalizedProgress.set(value[0] / max)}
        onPointerMove={(e) => {
          if (e.buttons <= 0) return
          const { left, width } = e.currentTarget.getBoundingClientRect()
          const overflow = e.clientX - left
          if (overflow < 0 || overflow > width) xNormalizedProgress.set(overflow / width);
        }}
        onPointerUp={() => {
          const clamped = clamp(0, 1, xNormalizedProgress.get())
          xNormalizedProgress.set(clamped)
        }}
      >
        <Track className={styles.Track}>
          <motion.div
            style={{
              x: spring,
              width: useTransform(spring, (value: number) => `${clamp(0, 1, value) * 100}%`)
            }} className={styles.temp} />
          {/* <Range className={styles.Range} /> */}
        </Track>
        <Thumb className={styles.Thumb} aria-label="Volume" />
      </MotionRoot>
    </>
  )
}

const MotionRoot = motion.create(Root)

export default SliderDemo;