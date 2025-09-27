import type { Sticking } from '../../../types.ts'

export function isAccented(char: Sticking): boolean {
  return char === char.toUpperCase()
}

export function flipHands(bar: Sticking[]): Sticking[] {
  return bar.map(char => {
    const accented = isAccented(char)
    const flippedHand: Sticking = char.toLowerCase() === 'r' ? 'l' : 'r'
    return accented ? (flippedHand.toUpperCase() as Sticking) : flippedHand
  })
}

export function ensureStartsWithRightHand(bar: Sticking[]): Sticking[] {
  if (bar.length > 0 && bar[0].toLowerCase() === 'l') {
    return flipHands(bar)
  }
  return bar
}