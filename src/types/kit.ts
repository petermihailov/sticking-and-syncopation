import type { Instrument } from './instrument'

// Драмкит — карта инструмент → аудиобуфер.
export type DrumKit = {
  [key in Instrument]?: AudioBuffer
}

// UI-группы для селектора инструментов в панели оркестровки.
export const INSTRUMENT_GROUPS = {
  Snare: [
    'snSnareRegular',
    'snSnareGhost',
    'snRimRegular',
  ] satisfies Instrument[],
  'Hi-hat': [
    'hhCloseRegular',
    'hhCloseGhost',
    'hhOpenRegular',
  ] satisfies Instrument[],
  Toms: [
    't1HighRegular',
    't2MidRegular',
    't3LowRegular',
  ] satisfies Instrument[],
  Cymbals: [
    'cyRideRegular',
    'cyCrashRegular',
    'cySplashRegular',
    'cyChinaRegular',
    'cyBellRegular',
    'cyEdgeRegular',
    'cyTrashRegular',
    'cyCowbellRegular',
  ] satisfies Instrument[],
  Kick: ['kiKickRegular', 'kiHhFootRegular'] satisfies Instrument[],
}
