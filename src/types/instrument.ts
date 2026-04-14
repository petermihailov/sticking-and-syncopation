// Перечисление всех инструментов кита и связанные базовые типы.
// Более крупные понятия (Bar, Kit, StickingMapping) вынесены в соседние файлы.

export type Instrument =
  // Cymbals
  | 'cyBellRegular'
  | 'cyChinaRegular'
  | 'cyCowbellRegular'
  | 'cyCrashRegular'
  | 'cyEdgeRegular'
  | 'cyRideRegular'
  | 'cySplashRegular'
  | 'cyTrashRegular'
  // Hi-hat
  | 'hhCloseGhost'
  | 'hhCloseRegular'
  | 'hhOpenRegular'
  // Kick
  | 'kiHhFootRegular'
  | 'kiKickRegular'
  // Snare
  | 'snRimRegular'
  | 'snSnareGhost'
  | 'snSnareRegular'
  // Toms
  | 't1HighRegular'
  | 't2MidRegular'
  | 't3LowRegular'
  // Metronome
  | 'fxMetronomeAccent'
  | 'fxMetronomeRegular'

export type Group = 'cy' | 'hh' | 'ki' | 'sn' | 't1' | 't2' | 't3' | 'fx'

export type Hand = 'r' | 'l' | null

export interface Beat {
  barIndex: number
  rhythmIndex: number
  instruments: Instrument[]
  /** Миллисекунды между grace note и основным ударом (только для флэмов) */
  flamOffsetMs?: number
}
