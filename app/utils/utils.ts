import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const clampNumber = (number: number, min: number, max: number): number =>
  Math.max(min, Math.min(number, max))

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
