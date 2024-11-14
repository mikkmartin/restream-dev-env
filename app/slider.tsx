'use client'

import { Root, Thumb, Track } from "@radix-ui/react-slider";
import { clamp, motion, transform, useMotionValue, useSpring, useTransform, ValueAnimationTransition, circOut, cubicBezier } from 'framer-motion';
import { useRef, useState } from "react";
import styles from './slider.module.scss';

const SliderDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Slider step={10} label={(nr: number) => `${nr}%`} />
    <Slider />
  </div>
);

type SliderProps = {
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  label?: (nr: number) => string
}

const slowmo = { duration: 2 } satisfies ValueAnimationTransition
const bouncy = { type: 'spring', stiffness: 500, damping: 25, mass: 1 } satisfies ValueAnimationTransition
const smooth = { type: 'spring', stiffness: 500, damping: 60, mass: 1 } satisfies ValueAnimationTransition
const snappy = { type: 'spring', stiffness: 2500, damping: 100, mass: 0.1 } satisfies ValueAnimationTransition

const WIDTH_PADDING = 16
const falloffEasing = cubicBezier(1.000, 0.250, 0.100, 0.250)

function Slider({ defaultValue = 40, min = 0, max = 100, step = 1, label }: SliderProps) {
  const motionValue = useMotionValue(defaultValue)
  const xNormalizedProgress = useMotionValue(valueToNormalized(defaultValue))
  const steppedProgress = useMotionValue(valueToNormalized(defaultValue))

  const layeredProgress = useTransform(xNormalizedProgress, (val: number) => (val + steppedProgress.get()) / 2)
  const spring = useSpring(layeredProgress, snappy)

  function updateProgress(ev: React.PointerEvent<HTMLDivElement>) {
    if (ev.buttons <= 0 || ev.target === ev.currentTarget) return
    const { left, width } = ev.currentTarget.getBoundingClientRect()
    const overflow = ev.clientX - left
    xNormalizedProgress.set(overflow / width);
  }

  function valueToNormalized(value: number) {
    return (value - min) / (max - min)
  }

  function getLabel() {
    if (typeof label === 'function') return useTransform(motionValue, label)
    return motionValue
  }

  function fallOffX(val: number) {
    const eased = transform(
      val,
      [1, 1.1],
      [1, 1.015],
      {
        ease: (v) => Math.pow(v, 0.5),
        clamp: false
      }
    )
    if (val > 1) return eased
    return eased * -1
  }

  function fallOffY(val: number) {
    return transform(val,
      [1, 0],
      [1, 0.9],
      {
        ease: (v) => Math.pow(v, 1),
        clamp: false
      })
  }

  const isDragging = useRef(false);

  return (
    <>
      <SliderRoot
        className={styles.Root}
        defaultValue={[defaultValue]}
        min={min}
        max={max}
        step={step}
        style={{
          x: useTransform(spring, (val: number) => val > 1 ? (val - 1) * 3 : val < 0 ? val * 3 : 1),
          scaleX: useTransform(spring, (val: number) => val > 1 ? fallOffX(val) : val < 0 ? fallOffX(1 + -val) : 1),
          scaleY: useTransform(spring, (val: number) => val > 1 ? fallOffY(2 - val) : val > 0 ? 1 : fallOffY(1 + val)),
          transformOrigin: useTransform(spring, (val: number) => val > 0.5 ? 'left' : 'right'),
        }}
        onValueChange={(value) => {
          motionValue.set(value[0])
          steppedProgress.set(valueToNormalized(value[0]))
          xNormalizedProgress.set(valueToNormalized(value[0]))
        }}
        onPointerDown={ev => {
          isDragging.current = true
          updateProgress(ev)
        }}
        onPointerMove={ev => isDragging.current && updateProgress(ev)}
        onPointerUp={() => {
          const clamped = clamp(0, 1, xNormalizedProgress.get())
          const normalizedStep = step / max
          const snapped = Math.round(clamped / normalizedStep) * normalizedStep
          xNormalizedProgress.set(snapped)
          isDragging.current = false
        }}
      >
        <Track className={styles.Track}>
          <motion.div
            className={styles.temp}
            style={{
              width: useTransform(spring, (v: number) =>
                `calc(${clamp(0, 1, v) * 100}% + ${transform(clamp(0, 1, v), [0, 0.05, 0.95, 1], [0, WIDTH_PADDING / 2, WIDTH_PADDING / 2, 0])}px)`
              )
            }}
          />
          <motion.div className={styles.label}>
            {getLabel()}
          </motion.div>
        </Track>
        <Thumb className={styles.Thumb} aria-label="Volume" />
      </SliderRoot>
      <pre className={styles.debug}>
        <span>xNormalizedProgress</span>
        <motion.span>{xNormalizedProgress}</motion.span>
        <span>motionValue</span>
        <motion.span>{motionValue}</motion.span>
      </pre>
    </>
  )
}

const SliderRoot = motion.create(Root)

export default SliderDemo;