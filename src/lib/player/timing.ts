import type { Bar } from '../../types/bar'

/**
 * Время между субдивизиями в секундах.
 * tempo — четверти в минуту (BPM), bar.timeDivision — субдивизий на долю.
 */
export function getTimeOffset(tempo: number, bar: Bar): number {
  if (!bar || !bar.timeDivision) return 0
  return 60 / (tempo * bar.timeDivision)
}
