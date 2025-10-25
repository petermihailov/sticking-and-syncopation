import type { Sticking } from '../../types.ts'

export function isAccented(char: Sticking): boolean {
  return char === char.toUpperCase()
}

export function flipHands(bar: Sticking[]): Sticking[] {
  const replaces: Record<Sticking, Sticking> = {
    r: 'l',
    l: 'r',
    R: 'L',
    L: 'R',
    k: 'k',
    ' ': ' ',
  }

  return bar.map(char => replaces[char])
}
