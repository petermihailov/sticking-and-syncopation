import type { Sticking } from '../../types.ts'

// Константы для оценки паттернов
export const PATTERN_SCORES = {
  INVALID: 0,
  VALID: 1,
  CREATES_DOUBLE: 2,
} as const

// Все невозможные переходы между ударами
export const INVALID_TRANSITIONS = [
  // Разные акценты одной рукой
  'Rr',
  'rR',
  'Ll',
  'lL',
  // Два акцента подряд одной рукой
  'RR',
  'LL',
  // Тройки тоже нельзя
  'rrr',
  'lll',
] as const

export function evaluatePatternQuality(
  result: Sticking[],
  pattern: string
): number {
  const testSequence = result.join('') + pattern

  if (
    INVALID_TRANSITIONS.some(transition => testSequence.includes(transition))
  ) {
    return PATTERN_SCORES.INVALID
  }

  // Check if the NEW pattern creates a double at the transition point
  // We need to check the junction between result and pattern
  if (result.length > 0) {
    const lastChar = result[result.length - 1]
    const firstCharOfPattern = pattern[0]
    const junction = lastChar + firstCharOfPattern

    if (junction === 'rr' || junction === 'll') {
      return PATTERN_SCORES.CREATES_DOUBLE
    }
  }

  return PATTERN_SCORES.VALID
}
