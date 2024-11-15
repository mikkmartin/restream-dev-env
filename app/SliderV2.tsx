'use client'

import NumberFlow from "@number-flow/react";
import { Root, Thumb, Track } from "@radix-ui/react-slider";
import { motion, transform, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from "react";
import useMeasure from 'react-use-measure';
import styles from './SliderV2.module.scss';
import { clampNumber } from "./utils/utils";

interface SliderProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  labelSuffix?: string
  disabled?: boolean
  icon?: React.ReactNode
  'aria-label'?: string
  onDragStart?: () => void
  onDragEnd?: () => void
}

const KNOB_OFFSET = -8
const snappy = { type: 'spring', stiffness: 1000, damping: 20, mass: 0.01 }

export function SliderV2({ defaultValue = 50, min = 0, max = 100, step = 1, disabled, labelSuffix, value: _value, icon, onValueChange, ...rest }: SliderProps) {
  const initialValue = _value ?? defaultValue
  const [value, setValue] = useState(initialValue);

  const initialXNormalizedProgress = valueToNormalized(initialValue)
  const xNormalizedProgress = useMotionValue(initialXNormalizedProgress)
  const steppedProgress = useMotionValue(initialXNormalizedProgress)

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

  function fallOffX(val: number) {
    const eased = transform(
      val,
      [1, 1.1],
      [1, 1.015],
      {
        ease: (v: number) => Math.pow(v, 0.5),
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
        ease: (v: number) => Math.pow(v, 1),
        clamp: false
      })
  }

  function handleStopDragging() {
    const clamped = clampNumber(xNormalizedProgress.get(), 0, 1)
    const normalizedStep = step / max
    const snapped = Math.round(clamped / normalizedStep) * normalizedStep
    xNormalizedProgress.set(snapped)
    isDragging.current = false
    rest.onDragEnd?.()
  }

  const isDragging = useRef(false);

  useEffect(() => {
    setValue(_value ?? defaultValue)
    steppedProgress.set(valueToNormalized(_value ?? defaultValue))
    xNormalizedProgress.set(valueToNormalized(_value ?? defaultValue))
  }, [_value])

  const [barRef, barSize] = useMeasure();
  const [iconRef, iconSize] = useMeasure();
  const [labelRef, labelSize] = useMeasure();

  const obstuctedPixels = useMemo(() => {
    return [iconSize, labelSize].reduce<[number, number][]>((acc, el) => {
      if (el.width === 0) return acc
      const PADDING = 4
      const { left, width } = el
      const startPixel = left - barSize.left - KNOB_OFFSET - PADDING
      const endPixel = startPixel + width + PADDING
      return [...acc, [startPixel, endPixel]]
    }, [])
  }, [barSize, iconSize, labelSize])

  return (
    <>
      <SliderRoot
        className={styles.root}
        defaultValue={[defaultValue]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        ref={barRef}
        style={{
          x: useTransform(spring, (val: number) => val > 1 ? (val - 1) * 3 : val < 0 ? val * 3 : 1),
          scaleX: useTransform(spring, (val: number) => val > 1 ? fallOffX(val) : val < 0 ? fallOffX(1 + -val) : 1),
          scaleY: useTransform(spring, (val: number) => val > 1 ? fallOffY(2 - val) : val > 0 ? 1 : fallOffY(1 + val)),
          //@ts-ignore
          transformOrigin: useTransform(spring, (val: number) => val > 0.5 ? 'left' : 'right'),
        }}
        value={[value]}
        onValueChange={(_value: number[]) => {
          const value = _value[0] ?? defaultValue
          setValue(value)
          steppedProgress.set(valueToNormalized(value))
          xNormalizedProgress.set(valueToNormalized(value))
          onValueChange?.(value)
        }}
        onPointerDown={(ev: React.PointerEvent<HTMLDivElement>) => {
          if (disabled) return
          isDragging.current = true
          updateProgress(ev)
          rest.onDragStart?.()
        }}
        onPointerMove={(ev: React.PointerEvent<HTMLDivElement>) => isDragging.current && updateProgress(ev)}
        onPointerUp={handleStopDragging}
        onPointerCancel={handleStopDragging}
      >
        <Track className={styles.track}>
          <motion.div
            className={styles.bar}
            style={{
              width: useTransform(spring, (v: number) => `calc(${clampNumber(v, 0, 1) * 100}%`
              ),
            }}
          />
          <motion.div
            className={styles.knob}
            style={{
              x: useTransform(spring, (normalizedValue: number) => {
                const v = normalizedValue * (barSize.width ?? 0)
                return v <= 8 ? KNOB_OFFSET * -1 : v >= barSize.width ? barSize.width + KNOB_OFFSET : v + KNOB_OFFSET
              }),
              opacity: useTransform(spring, (normalizedValue: number) => {
                if (!barSize.width) return 0
                const val = normalizedValue * (barSize.width ?? 0)
                return obstuctedPixels.some(([start, end]) => val > start && val < end) ? 0 : 1
              }),
            }}
          />
          {icon && <div ref={iconRef} className={styles.icon}>{icon}</div>}
          <motion.div ref={labelRef} className={styles.label}>
            <span>
              <NumberFlow
                trend
                continuous
                willChange
                value={value}
                transformTiming={{ duration: 100 }}
                opacityTiming={{ duration: 100 }}
                spinTiming={{ duration: 100 }}
              />
              {labelSuffix}
            </span>
          </motion.div>
        </Track>
        <Thumb className={styles.thumb} aria-label={rest['aria-label']} />
      </SliderRoot>
      {/* <pre className={styles.debug}>
        <span>xNormalizedProgress</span>
        <motion.span>{xNormalizedProgress}</motion.span>
        <span>value</span>
        <motion.span>{value}</motion.span>
      </pre> */}
    </>
  )
}

export function CurveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 7.0003C17 7.0003 15.5 7 12 7.0003C8.5 7.0006 7 9 7 12.0003C7 15.0006 7 17.0003 7 17.0003" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SliderRoot = motion(Root)