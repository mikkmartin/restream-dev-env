'use client'

import { Root, Thumb, Track } from "@radix-ui/react-slider";
import { clamp, motion, useMotionValue, useSpring, useTransform, ValueAnimationTransition } from 'framer-motion';
import { useState } from "react";
import styles from './slider.module.scss';

const SliderDemo = () => (
  <form>
    <Slider />
  </form>
);

type SliderProps = {
  defaultValue?: number
  min?: number
  max?: number
  step?: number
}

export const slowmo = { duration: 2 } satisfies ValueAnimationTransition
export const bouncy = { type: 'spring', stiffness: 500, damping: 25, mass: 1 } satisfies ValueAnimationTransition
export const smooth = { type: 'spring', stiffness: 500, damping: 60, mass: 1 } satisfies ValueAnimationTransition
export const snappy = { type: 'spring', stiffness: 2500, damping: 100, mass: 0.1 } satisfies ValueAnimationTransition

function Slider({ defaultValue = 50, min = 0, max = 100, step = 20 }: SliderProps) {
  const motionValue = useMotionValue(0.5)
  const xNormalizedProgress = useMotionValue(0.5)
  const steppedProgress = useMotionValue(0.5)

  const layeredProgress = useTransform(xNormalizedProgress, (val: number) => (val + steppedProgress.get()) / 2)
  const spring = useSpring(layeredProgress, snappy)

  function updateProgress(ev: React.PointerEvent<HTMLDivElement>) {
    if (ev.buttons <= 0) return
    const { left, width } = ev.currentTarget.getBoundingClientRect()
    const overflow = ev.clientX - left
    xNormalizedProgress.set(overflow / width);
  }

  function valueToNormalized(value: number) {
    return (value - min) / (max - min)
  }

  //temp
  const [showThumb, setShowThumb] = useState(false)

  return (
    <>
      <SliderRoot
        className={styles.Root}
        defaultValue={[defaultValue]}
        min={min}
        max={max}
        step={step}
        style={{
          x: useTransform(spring, (val: number) => val > 1 ? (val - 1) * 30 : val < 0 ? val * 30 : 1),
          scaleX: useTransform(spring, (val: number) => val > 1 ? val : val < 0 ? 1 + -val : 1),
          scaleY: useTransform(spring, (val: number) => val > 1 ? 1 + 1 - val : val > 0 ? 1 : 1 + val),
          transformOrigin: useTransform(spring, (val: number) => val > 0.5 ? 'left' : 'right'),
        }}
        onValueChange={(value) => {
          motionValue.set(value[0])
          steppedProgress.set(valueToNormalized(value[0]))
          xNormalizedProgress.set(valueToNormalized(value[0]))
        }}
        onPointerDown={updateProgress}
        onPointerMove={updateProgress}
        onPointerUp={() => {
          const clamped = clamp(0, 1, xNormalizedProgress.get())
          const normalizedStep = step / max
          const snapped = Math.round(clamped / normalizedStep) * normalizedStep
          xNormalizedProgress.set(snapped)
        }}
      >
        <Track className={styles.Track}>
          <motion.div
            style={{
              width: useTransform(spring, (value: number) => `${clamp(0, 1, value) * 100}%`)
            }} className={styles.temp} />
          <motion.div className={styles.label}>
            {motionValue}
          </motion.div>
        </Track>
        <Thumb className={styles.Thumb} aria-label="Volume" />
      </SliderRoot>
      <pre className={styles.debug}>
        <span>xNormalizedProgress</span>
        <motion.span>{xNormalizedProgress}</motion.span>
        <span>motionValue</span>
        <motion.span>{motionValue}</motion.span>
        <span>showThumb</span>
        <input type="checkbox" checked={showThumb} onChange={(ev) => setShowThumb(ev.target.checked)} />
      </pre>
    </>
  )
}

const SliderRoot = motion.create(Root)

export default SliderDemo;