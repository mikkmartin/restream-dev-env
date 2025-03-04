import { Shape } from './types'
import { CSSProperties } from 'react'

export function getShapeStyles(shape: Shape): CSSProperties {
  switch (shape) {
    case 'landscape':
      return { aspectRatio: '16/10', borderRadius: '0.5rem' }
    case 'portrait':
      return { aspectRatio: '10/16', borderRadius: '0.5rem' }
    case 'square':
      return { aspectRatio: '1/1', borderRadius: '0.5rem' }
    case 'circle':
      return { aspectRatio: '1/1', borderRadius: '50%' }
    default:
      return { aspectRatio: '16/10', borderRadius: '0.5rem' }
  }
}
