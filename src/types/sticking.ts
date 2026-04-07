import type { Instrument } from './instrument'

// Voice — инструмент с политикой воспроизведения (gain, playbackRate).
// Создаётся резолвером по правилам политики; AudioEngine просто играет voice.
export interface InstrumentVoice {
  instrument: Instrument
  gain?: number
  rate?: number
}

// Маппинг стикинга (R/L/r/l/k) → набор инструментов для ротации.
// UI оркестровки оперирует именно этим типом — массивами имён инструментов.
export interface StickingMapping {
  uppercaseR: Instrument[]
  uppercaseL: Instrument[]
  uppercaseRKick: boolean
  uppercaseLKick: boolean
  lowercaseR: Instrument[]
  lowercaseL: Instrument[]
  kick: Instrument[]
}

export const DEFAULT_STICKING_MAPPING: StickingMapping = {
  uppercaseR: ['snSnareRegular'],
  uppercaseL: ['snSnareRegular'],
  uppercaseRKick: false,
  uppercaseLKick: false,
  lowercaseR: ['snSnareGhost'],
  lowercaseL: ['snSnareGhost'],
  kick: ['kiKickRegular'],
}
