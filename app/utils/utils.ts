export const clampNumber = (number: number, min: number, max: number): number =>
    Math.max(min, Math.min(number, max))