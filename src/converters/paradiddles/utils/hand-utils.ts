import type { Sticking } from '../../../types.ts'

export function isAccented(char: Sticking): boolean {
  return char === char.toUpperCase()
}

export function flipHands(bar: Sticking[]) {
  const replaces = {
    r: 'l',
    l: 'r',
    R: 'L',
    L: 'R',
  }

  return bar.map(char => replaces[char]) as Sticking[]
}
