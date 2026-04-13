import type { Sticking } from '../types'

const MIRROR_MAP: Record<string, string> = {
  R: 'L',
  L: 'R',
  r: 'l',
  l: 'r',
}

/** Зеркалирует стикинг: R↔L, r↔l. Остальные символы (k, пробел, ') без изменений. */
export function mirrorSticking(pattern: string): string {
  return pattern.replace(/[RLrl]/g, ch => MIRROR_MAP[ch])
}

/** Зеркалирует массив стикингов поэлементно. */
export function mirrorStickings(stickings: Sticking[]): Sticking[] {
  return stickings.map(s => (MIRROR_MAP[s] as Sticking) ?? s)
}
