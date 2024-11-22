'use client'

import { Root, Thumb, Track } from "@radix-ui/react-slider";
import { motion, transform, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useMeasure from 'react-use-measure';
import styles from './SliderV2.module.scss';
import { clampNumber } from "../utils/utils";

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
const MAX_FALLOFF_DISTANCE_NORMALIZED = 3
const snappy = { type: 'spring', stiffness: 1000, damping: 20, mass: 0.01 }

export function SliderV2({ defaultValue = 50, min = 0, max = 100, step = 1, disabled, labelSuffix, value: _value, icon, onValueChange, ...rest }: SliderProps) {
  const initialValue = _value ?? defaultValue
  const [value, setValue] = useState(initialValue);

  const initialXNormalizedProgress = valueToNormalized(initialValue, min, max)
  const xNormalizedProgress = useMotionValue(initialXNormalizedProgress)
  const steppedProgress = useMotionValue(initialXNormalizedProgress)

  const layeredProgress = useTransform(xNormalizedProgress, (val: number) => (val + steppedProgress.get()) / 2)
  const spring = useSpring(layeredProgress, snappy)

  const [barRef, barSize] = useMeasure();
  const [iconRef, iconSize] = useMeasure();
  const [labelRef, labelSize] = useMeasure();

  const isDragging = useRef(false);

  const handleUpdateProgress = useCallback((ev: React.PointerEvent<HTMLDivElement>) => {
    if (ev.buttons <= 0 || ev.target === ev.currentTarget || !isDragging.current) return
    const { left, width } = ev.currentTarget.getBoundingClientRect()
    const overflow = ev.clientX - left
    xNormalizedProgress.set(overflow / width);
  }, [xNormalizedProgress]);

  const handleStopDragging = useCallback(() => {
    const clamped = clampNumber(xNormalizedProgress.get(), 0, 1)
    const normalizedStep = step / max
    const snapped = Math.round(clamped / normalizedStep) * normalizedStep
    xNormalizedProgress.set(snapped)
    isDragging.current = false
    rest.onDragEnd?.()
  }, [xNormalizedProgress, step, max, rest.onDragEnd]);

  useEffect(() => {
    setValue(_value ?? defaultValue)
    steppedProgress.set(valueToNormalized(_value ?? defaultValue, min, max))
    xNormalizedProgress.set(valueToNormalized(_value ?? defaultValue, min, max))
  }, [_value])

  const obstuctedPixels = useMemo(() => {
    return [iconSize, labelSize].reduce<[number, number][]>((acc, el) => {
      if (el.width === 0) return acc
      const { left, width } = el
      const startPixel = left - barSize.left - KNOB_OFFSET
      const endPixel = startPixel + width
      return [...acc, [startPixel, endPixel]]
    }, [])
  }, [barSize, iconSize, labelSize])

  const transformFalloff = useCallback((val: number) => {
    if (val > 1) return fallOffX(val)
    if (val < 0) return fallOffX(1 + -val)
    return 1
  }, [])

  const transformScaleY = useCallback((val: number) => {
    if (val > 1) return fallOffY(2 - val)
    if (val > 0) return 1
    return fallOffY(1 + val)
  }, [])

  const handleValueChange = useCallback((_value: number[]) => {
    const value = _value[0] ?? defaultValue
    setValue(value)
    steppedProgress.set(valueToNormalized(value, min, max))
    xNormalizedProgress.set(valueToNormalized(value, min, max))
    onValueChange?.(value)
  }, [defaultValue, steppedProgress, xNormalizedProgress, onValueChange])

  const handlePointerDown = useCallback((ev: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    isDragging.current = true
    handleUpdateProgress(ev)
    rest.onDragStart?.()
  }, [disabled, handleUpdateProgress, rest.onDragStart]);

  const transformOriginHandler = useCallback((val: number) =>
    val > 0.5 ? 'left' : 'right'
    , []);

  const handleBarWidthTransform = useCallback((v: number) =>
    `calc(${clampNumber(v, 0, 1) * 100}%`
    , []);

  const handleBorderRadiusTransform = useCallback((v: number) => {
    const vPixels = v * (barSize.width ?? 0)
    return vPixels <= 16 ? transform(vPixels, [8, 16], [0, 6], { clamp: true }) : 6
  }, [barSize.width]);

  const handleKnobPositionTransform = useCallback((normalizedValue: number) => {
    const v = normalizedValue * (barSize.width ?? 0)
    if (v <= 14) return 14 + KNOB_OFFSET
    if (v >= barSize.width - 12) return barSize.width - 8
    return v <= KNOB_OFFSET * 2 ? KNOB_OFFSET * -1 : v >= barSize.width ? barSize.width + KNOB_OFFSET : v + KNOB_OFFSET
  }, [barSize.width]);

  const handleKnobOpacityTransform = useCallback((normalizedValue: number) => {
    if (!barSize.width) return 0
    const val = normalizedValue * (barSize.width ?? 0)
    return obstuctedPixels.some(([start, end]) => val > start && val < end) ? 0 : 1
  }, [barSize.width, obstuctedPixels]);

  const handleHitBoxTransform = useCallback((normalizedValue: number) => {
    const valPx = normalizedValue * (barSize.width ?? 0)
    return valPx < 20 ? Math.min(14 - valPx, 14) : 0
  }, [barSize.width]);

  return (
    <SliderRoot
      className={styles.root}
      defaultValue={[defaultValue]}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      ref={barRef}
      style={{
        x: useTransform(spring, transformFalloff),
        scaleX: useTransform(spring, transformFalloff),
        scaleY: useTransform(spring, transformScaleY),
        //@ts-ignore
        transformOrigin: useTransform(spring, transformOriginHandler),
      }}
      value={[value]}
      onValueChange={handleValueChange}
      onPointerDown={handlePointerDown}
      onPointerMove={handleUpdateProgress}
      onPointerUp={handleStopDragging}
      onPointerCancel={handleStopDragging}
    >
      <Track className={styles.track}>
        <motion.div
          className={styles.bar}
          style={{
            width: useTransform(spring, handleBarWidthTransform),
            borderRadius: useTransform(spring, handleBorderRadiusTransform),
          }}
        />
        <motion.div
          className={styles.knob}
          style={{
            x: useTransform(spring, handleKnobPositionTransform),
            opacity: useTransform(spring, handleKnobOpacityTransform),
          }}
        />
        {icon && <div ref={iconRef} className={styles.icon}>{icon}</div>}
        <motion.div ref={labelRef} className={styles.label}>
          {value}
          {labelSuffix}
        </motion.div>
      </Track>
      <HitBox
        style={{
          x: useTransform(xNormalizedProgress, handleHitBoxTransform),
        }}
        className={styles.hitBox}
        aria-label={rest['aria-label']}
      />
    </SliderRoot>
  )
}

const HitBox = motion(Thumb)

function easeOutSine(x: number): number {
  return Math.sqrt(1 - Math.pow(x - 1, 2))
}

function valueToNormalized(value: number, min: number, max: number) {
  return (value - min) / (max - min)
}

function fallOffX(val: number) {
  const eased = transform(
    val,
    [1, MAX_FALLOFF_DISTANCE_NORMALIZED],
    [1, 1.05],
    {
      ease: easeOutSine,
      clamp: true
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
      ease: (v: number) => Math.pow(v, 1.25),
      clamp: true
    })
}

const SliderRoot = motion(Root)