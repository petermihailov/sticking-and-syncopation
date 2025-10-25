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
  const testSequence = result.join() + pattern

  if (
    INVALID_TRANSITIONS.some(transition => testSequence.includes(transition))
  ) {
    return PATTERN_SCORES.INVALID
  }

  if (['rr', 'll'].some(transition => testSequence.includes(transition))) {
    return PATTERN_SCORES.CREATES_DOUBLE
  }

  return PATTERN_SCORES.VALID
}
