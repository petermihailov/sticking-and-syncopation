import type { RudimentType } from '../converters/registry'
import { TEMPO } from '../config/constants'
import type { StickingMapping } from './sticking'
import { DEFAULT_STICKING_MAPPING } from './sticking'

/** Ведущая рука */
export type LeadingHand = 'R' | 'L'

/** Доступные наборы звуков метронома (соответствуют файлам в public/sounds/clicks/) */
export const CLICK_SOUNDS = [
  'blip',
  'classic',
  'cowbell',
  'digital',
  'percussive',
  'saw',
  'woodblock',
] as const

export type ClickSound = (typeof CLICK_SOUNDS)[number]

/**
 * Application state that can be shared via URL and persisted in localStorage
 */
export interface AppState {
  /** Accent pattern - 8 boolean values representing accent positions */
  accents: boolean[]
  /** Selected rudiment type */
  rudiment: RudimentType
  /** Playback tempo in BPM */
  tempo: number
  /** Whether metronome is enabled */
  metronome: boolean
  /** Metronome volume (0.0 - 1.0), stored in localStorage only */
  metronomeVolume: number
  /** Громкость воспроизведения инструментов (0.0 - 1.0) */
  playbackVolume: number
  /** Набор звуков метронома */
  metronomeSound: ClickSound
  /** Instrument mapping for stickings */
  instrumentMapping: StickingMapping
  /** Ведущая рука (R — правая, L — левая) */
  leadingHand: LeadingHand
}

/**
 * Default application state
 */
export const DEFAULT_APP_STATE: AppState = {
  accents: [false, false, false, false, false, false, false, false],
  rudiment: '16th-paradiddle-single-accent',
  tempo: TEMPO.DEFAULT,
  metronome: false,
  metronomeVolume: 1.0,
  playbackVolume: 1.0,
  metronomeSound: 'blip',
  instrumentMapping: DEFAULT_STICKING_MAPPING,
  leadingHand: 'R',
}
