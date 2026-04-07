import type { StickingMapping, Instrument } from '../types/instrument'
import { DEFAULT_APP_STATE } from '../types/appState'

/**
 * Мигрирует старый формат StickingMapping (одиночные инструменты)
 * к новому формату (массивы для ротации).
 */
export function migrateStickingMapping(mapping: unknown): StickingMapping {
  if (!mapping || typeof mapping !== 'object') {
    return DEFAULT_APP_STATE.instrumentMapping
  }

  const m = mapping as Record<string, unknown>

  // Уже мигрировано
  if (Array.isArray(m.uppercaseR)) {
    return mapping as StickingMapping
  }

  // Конвертим одиночные инструменты в массивы
  return {
    uppercaseR: [m.uppercaseR] as Instrument[],
    uppercaseL: [m.uppercaseL] as Instrument[],
    uppercaseRKick: (m.uppercaseRKick as boolean) ?? false,
    uppercaseLKick: (m.uppercaseLKick as boolean) ?? false,
    lowercaseR: [m.lowercaseR] as Instrument[],
    lowercaseL: [m.lowercaseL] as Instrument[],
    kick: [m.kick] as Instrument[],
  }
}
