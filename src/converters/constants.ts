import type { Sticking } from '../types.ts'

// Константы для оценки паттернов
export const PATTERN_SCORES = {
  INVALID: 0,
  VALID: 1,
  CREATES_DOUBLE: 2,
} as const

// Константы для специальных случаев
export const SPECIAL_PATTERNS = {
  ALL_ZEROS_INVERT_DOUBLE: [
    'r',
    'l',
    'l',
    'r',
    'r',
    'l',
    'l',
    'r',
    'r',
    'l',
    'l',
    'r',
    'r',
    'l',
    'l',
    'r',
  ] as Sticking[],
  ALL_ONES_INVERT_DOUBLE: [
    'R',
    'L',
    'R',
    'L',
    'R',
    'L',
    'R',
    'L',
    'R',
    'L',
    'R',
    'L',
    'R',
    'L',
    'R',
    'L',
  ] as Sticking[],
} as const

// Все невозможные переходы между символами
export const INVALID_TRANSITIONS = [
  'Rr',
  'rR',
  'Ll',
  'lL', // Разные акценты одной рукой
  'RR',
  'LL', // Два акцента подряд одной рукой
] as const