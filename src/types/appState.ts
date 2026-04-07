import type { RudimentType } from '../converters/registry'
import type { StickingMapping } from './sticking'
import { DEFAULT_STICKING_MAPPING } from './sticking'

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
 * Favorite preset - subset of AppState that can be saved and loaded
 */
export interface FavoritePreset {
  /** Unique identifier for the preset */
  id: string
  /** User-defined name for the preset */
  name: string
  /** Timestamp when preset was created */
  createdAt: number
  /** Accent pattern */
  accents: boolean[]
  /** Selected rudiment type */
  rudiment: RudimentType
  /** Playback tempo in BPM */
  tempo: number
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
