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

export type DrumKit = {
  [key in Instrument]?: AudioBuffer
}

export interface Beat {
  barIndex: number
  rhythmIndex: number
  instruments: Instrument[]
}

export type Hand = 'r' | 'l' | null

export interface StickingMapping {
  uppercaseR: Instrument[] // For R (right hand regular) - array for rotation
  uppercaseL: Instrument[] // For L (left hand regular) - array for rotation
  uppercaseRKick: boolean // Add kick to R
  uppercaseLKick: boolean // Add kick to L
  lowercaseR: Instrument[] // For r (right hand ghost) - array for rotation
  lowercaseL: Instrument[] // For l (left hand ghost) - array for rotation
  kick: Instrument[] // For k (kick) - array for rotation
}

// Default sticking mapping
export const DEFAULT_STICKING_MAPPING: StickingMapping = {
  uppercaseR: ['snSnareRegular'],
  uppercaseL: ['snSnareRegular'],
  uppercaseRKick: false,
  uppercaseLKick: false,
  lowercaseR: ['snSnareGhost'],
  lowercaseL: ['snSnareGhost'],
  kick: ['kiKickRegular'],
}

// Grouped instruments for UI selection
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

// Bar represents a measure with rhythm information
export interface Bar {
  // Array of instruments to play at each rhythm subdivision
  rhythm: Instrument[][]
  // Optional array of sticking symbols for rotation (e.g., ['R', 'l', 'r', 'r', ...])
  stickings?: string[]
  // Optional array of hands for each subdivision (for pitch shifting)
  hands?: Hand[]
  // Time signature
  beatsPerBar: number // e.g., 4 for 4/4
  noteValue: number // e.g., 4 for quarter notes
  // Time division (how many subdivisions per beat)
  timeDivision: number // e.g., 4 for sixteenth notes
}
