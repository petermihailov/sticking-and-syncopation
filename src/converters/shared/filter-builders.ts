import type { StickingPattern } from '../../types.ts'

/** Filter patterns that contain only lowercase characters */
export function requireAllLowercase(patterns: StickingPattern[]): StickingPattern[] {
  return patterns.filter(p => p.split('').every(c => c === c.toLowerCase()))
}

/** Filter patterns that contain at least one uppercase character */
export function requireSomeUppercase(patterns: StickingPattern[]): StickingPattern[] {
  return patterns.filter(p => p.split('').some(c => c !== c.toLowerCase() && c === c.toUpperCase()))
}

/** Filter patterns that contain only uppercase characters */
export function requireAllUppercase(patterns: StickingPattern[]): StickingPattern[] {
  return patterns.filter(p => p.split('').every(c => c !== c.toLowerCase() && c === c.toUpperCase()))
}

/** Filter patterns that contain at least one lowercase character */
export function requireSomeLowercase(patterns: StickingPattern[]): StickingPattern[] {
  return patterns.filter(p => p.split('').some(c => c !== c.toUpperCase() && c === c.toLowerCase()))
}

/** Filter patterns that contain a specific character */
export function preferChar(char: string) {
  return (patterns: StickingPattern[]): StickingPattern[] => {
    return patterns.filter(p => p.includes(char))
  }
}

/** Filter patterns that start with a specific character (case-insensitive) */
export function preferStartingWith(char: string) {
  return (patterns: StickingPattern[]): StickingPattern[] => {
    return patterns.filter(p => p[0].toLowerCase() === char.toLowerCase())
  }
}

/** Get the opposite hand */
export function getOppositeHand(hand: 'R' | 'L' | 'r' | 'l' | 'k' | ' '): 'l' | 'r' {
  const lower = hand.toLowerCase()
  if (lower === 'r' || lower === 'k' || lower === ' ') return 'l'
  return 'r'
}
