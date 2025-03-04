import { atom } from 'jotai'
import { Shape } from './types'

export const scaleAtom = atom(1)
export const paddingAtom = atom(10)
export const selectedShapeAtom = atom<Shape>('landscape')
export const multipleElementsAtom = atom(false)
export const debugModeAtom = atom(false)

// Snap points and dragging state
export const snapPointsAtom = atom<Array<{ x: number; y: number }>>([])
export const isDraggingAtom = atom(false)
export const isCommandPressedAtom = atom(false)
export const closestSnapPointIndexAtom = atom<number | null>(null)
export const snappedPointIndexAtom = atom<number | null>(null)
export const lastManualSnapPositionAtom = atom<{
  index: number | null
  x: number
  y: number
} | null>(null)
