export const TEMPO = {
  MIN: 20,
  MAX: 300,
  DEFAULT: 130,
} as const

export const FLAM = {
  // Динамический офсет: ≤60 BPM, ≥200 BPM, линейно между ними
  OFFSET_MAX: 0.07,
  OFFSET_MIN: 0.02,
  TEMPO_SLOW: 60,
  TEMPO_FAST: 200,
  GAIN_MULTIPLIER: 2,
} as const

/** Офсет grace note в секундах, зависит от темпа */
export function getFlamOffset(tempo: number): number {
  if (tempo <= FLAM.TEMPO_SLOW) return FLAM.OFFSET_MAX
  if (tempo >= FLAM.TEMPO_FAST) return FLAM.OFFSET_MIN
  const t = (tempo - FLAM.TEMPO_SLOW) / (FLAM.TEMPO_FAST - FLAM.TEMPO_SLOW)
  return FLAM.OFFSET_MAX - t * (FLAM.OFFSET_MAX - FLAM.OFFSET_MIN)
}
