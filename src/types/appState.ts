import type { RudimentType } from '../types.ts'
import type { StickingMapping } from './instrument'
import { DEFAULT_STICKING_MAPPING } from './instrument'

/**
 * Application state that can be shared via URL and persisted in localStorage
 */
export interface AppState {
  /** Accent pattern - 8 boolean values representing accent positions */
  accents: boolean[]
  /** Selected rudiment type */
  rudiment: RudimentType
  /** Playback tempo in BPM (40-200) */
  tempo: number
  /** Whether metronome is enabled */
  metronome: boolean
  /** Metronome volume (0.0 - 1.0), stored in localStorage only */
  metronomeVolume: number
  /** Instrument mapping for stickings */
  instrumentMapping: StickingMapping
}

/**
 * Default application state
 */
export const DEFAULT_APP_STATE: AppState = {
  accents: [false, false, false, false, false, false, false, false],
  rudiment: '16th-paradiddle-single-accent',
  tempo: 80,
  metronome: false,
  metronomeVolume: 1.0,
  instrumentMapping: DEFAULT_STICKING_MAPPING,
}
