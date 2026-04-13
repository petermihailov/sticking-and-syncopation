import type { FlamPattern, Sticking3 } from '../../types'

// Паттерны содержат флэм-маркер ' перед нотой.
// ' означает grace note противоположной рукой перед основным ударом.
export const replaces = {
  '00': ['rlr', 'lrl'] as Sticking3[],
  '01': [`rl'R`, `lr'L`] as FlamPattern[],
  '10': [`'Rlr`, `'Lrl`] as FlamPattern[],
  '11': [`'Rl'R`, `'Lr'L`] as FlamPattern[],
}
