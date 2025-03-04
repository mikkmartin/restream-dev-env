export const shapes = ['landscape', 'portrait', 'square', 'circle'] as const
export type Shape = (typeof shapes)[number]

export interface SnapPoint {
  x: number
  y: number
}

export interface LastManualSnapPosition {
  index: number | null
  x: number
  y: number
}
