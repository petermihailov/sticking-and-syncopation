import type { RudimentType } from '../types.ts'
import type { Instrument, StickingMapping } from '../types/instrument'
import type { AppState } from '../types/appState'
import { DEFAULT_STICKING_MAPPING } from '../types/instrument'
import { DEFAULT_APP_STATE } from '../types/appState'

/**
 * Rudiment type to 2-character code mapping
 */
const RUDIMENT_CODES: Record<RudimentType, string> = {
  '16th-paradiddle-single-accent': 'ps',
  '16th-paradiddle-double-accent': 'pd',
  '16th-invert-paradiddle-single-accent': 'is',
  '16th-invert-paradiddle-double-accent': 'id',
  '16th-invert-paradiddle-kick': 'ik',
  '8th-hand-to-hand-triplets': 'h3',
  '16th-hand-to-hand-triplets': '16',
}

const RUDIMENT_DECODE: Record<string, RudimentType> = Object.fromEntries(
  Object.entries(RUDIMENT_CODES).map(([k, v]) => [v, k as RudimentType])
)

/**
 * Instrument to 2-character code mapping
 */
const INSTRUMENT_CODES: Record<Instrument, string> = {
  // Snare
  'snSnareRegular': 'sn',
  'snSnareAccent': 'sa',
  'snSnareGhost': 'sg',
  'snRimRegular': 'sr',
  // Hi-hat
  'hhCloseRegular': 'hc',
  'hhCloseAccent': 'ha',
  'hhCloseGhost': 'hg',
  'hhOpenRegular': 'ho',
  'hhOpenAccent': 'hx',
  // Toms
  't1HighRegular': 't1',
  't1HighAccent': 'ta',
  't2MidRegular': 't2',
  't2MidAccent': 'tb',
  't3LowRegular': 't3',
  't3LowAccent': 'tc',
  // Cymbals
  'cyRideRegular': 'rd',
  'cyCrashRegular': 'cr',
  'cySplashRegular': 'sp',
  'cyChinaRegular': 'ch',
  'cyBellRegular': 'bl',
  'cyEdgeRegular': 'ed',
  'cyTrashRegular': 'tr',
  'cyCowbellRegular': 'cb',
  // Kick
  'kiKickRegular': 'ki',
  'kiHhFootRegular': 'kf',
  // Metronome
  'fxMetronomeAccent': 'ma',
  'fxMetronomeRegular': 'mr',
}

const INSTRUMENT_DECODE: Record<string, Instrument> = Object.fromEntries(
  Object.entries(INSTRUMENT_CODES).map(([k, v]) => [v, k as Instrument])
)

/**
 * Encode accent pattern to hex string
 * [true, false, true, false, false, true, false, false] -> "A4"
 */
export function encodeAccents(accents: boolean[]): string {
  if (accents.length !== 8) {
    throw new Error('Accents array must have exactly 8 elements')
  }

  // Convert boolean array to binary string, then to hex
  const binary = accents.map(a => a ? '1' : '0').join('')
  const decimal = parseInt(binary, 2)
  return decimal.toString(16).toUpperCase().padStart(2, '0')
}

/**
 * Decode hex string to accent pattern
 * "A4" -> [true, false, true, false, false, true, false, false]
 */
export function decodeAccents(hex: string): boolean[] {
  const decimal = parseInt(hex, 16)
  const binary = decimal.toString(2).padStart(8, '0')
  return binary.split('').map(bit => bit === '1')
}

/**
 * Encode rudiment type to 2-character code
 */
export function encodeRudiment(rudiment: RudimentType): string {
  return RUDIMENT_CODES[rudiment] || 'ps'
}

/**
 * Decode 2-character code to rudiment type
 */
export function decodeRudiment(code: string): RudimentType {
  return RUDIMENT_DECODE[code] || '16th-paradiddle-single-accent'
}

/**
 * Check if two instrument arrays are equal
 */
function arraysEqual(a: Instrument[], b: Instrument[]): boolean {
  if (a.length !== b.length) return false
  return a.every((val, idx) => val === b[idx])
}

/**
 * Check if instrument mapping is default
 */
export function isDefaultMapping(mapping: StickingMapping): boolean {
  return (
    arraysEqual(mapping.uppercaseR, DEFAULT_STICKING_MAPPING.uppercaseR) &&
    arraysEqual(mapping.uppercaseL, DEFAULT_STICKING_MAPPING.uppercaseL) &&
    mapping.uppercaseRKick === DEFAULT_STICKING_MAPPING.uppercaseRKick &&
    mapping.uppercaseLKick === DEFAULT_STICKING_MAPPING.uppercaseLKick &&
    arraysEqual(mapping.lowercaseR, DEFAULT_STICKING_MAPPING.lowercaseR) &&
    arraysEqual(mapping.lowercaseL, DEFAULT_STICKING_MAPPING.lowercaseL) &&
    arraysEqual(mapping.kick, DEFAULT_STICKING_MAPPING.kick)
  )
}

/**
 * Encode instrument mapping to compact string
 * Returns null if mapping is default (to omit from URL)
 * Format: "R,L,r,l,k,Rk,Lk" where each field can be pipe-separated for arrays
 * Example: "sn|rd|bl,sn,sg,sg,ki,1,0" for uppercaseR=[snare, ride, bell]
 */
export function encodeOrchestration(mapping: StickingMapping): string | null {
  if (isDefaultMapping(mapping)) {
    return null
  }

  const encodeArray = (instruments: Instrument[]): string => {
    return instruments.map(inst => INSTRUMENT_CODES[inst]).join('|')
  }

  const parts = [
    encodeArray(mapping.uppercaseR),
    encodeArray(mapping.uppercaseL),
    encodeArray(mapping.lowercaseR),
    encodeArray(mapping.lowercaseL),
    encodeArray(mapping.kick),
    mapping.uppercaseRKick ? '1' : '0',
    mapping.uppercaseLKick ? '1' : '0',
  ]

  return parts.join(',')
}

/**
 * Decode orchestration string to instrument mapping
 * "sn|rd|bl,sn,sg,sg,ki,1,0" -> StickingMapping with arrays
 */
export function decodeOrchestration(value: string): StickingMapping {
  const parts = value.split(',')

  if (parts.length !== 7) {
    return DEFAULT_STICKING_MAPPING
  }

  try {
    const decodeArray = (encoded: string, defaultValue: Instrument[]): Instrument[] => {
      const codes = encoded.split('|')
      const instruments = codes
        .map(code => INSTRUMENT_DECODE[code])
        .filter(inst => inst !== undefined)

      return instruments.length > 0 ? instruments : defaultValue
    }

    return {
      uppercaseR: decodeArray(parts[0], DEFAULT_STICKING_MAPPING.uppercaseR),
      uppercaseL: decodeArray(parts[1], DEFAULT_STICKING_MAPPING.uppercaseL),
      lowercaseR: decodeArray(parts[2], DEFAULT_STICKING_MAPPING.lowercaseR),
      lowercaseL: decodeArray(parts[3], DEFAULT_STICKING_MAPPING.lowercaseL),
      kick: decodeArray(parts[4], DEFAULT_STICKING_MAPPING.kick),
      uppercaseRKick: parts[5] === '1',
      uppercaseLKick: parts[6] === '1',
    }
  } catch {
    return DEFAULT_STICKING_MAPPING
  }
}

/**
 * Encode app state to URL query string
 * Returns query string without leading "?"
 */
export function encodeStateToUrl(state: AppState): string {
  const params = new URLSearchParams()

  // Always include accents (core param)
  params.set('a', encodeAccents(state.accents))

  // Include rudiment only if not default
  if (state.rudiment !== DEFAULT_APP_STATE.rudiment) {
    params.set('r', encodeRudiment(state.rudiment))
  }

  // Include tempo if not default
  if (state.tempo !== DEFAULT_APP_STATE.tempo) {
    params.set('t', state.tempo.toString())
  }

  // Include metronome if enabled
  if (state.metronome) {
    params.set('m', '1')
  }

  // Include orchestration if not default
  const orchestration = encodeOrchestration(state.instrumentMapping)
  if (orchestration) {
    params.set('o', orchestration)
  }

  return params.toString()
}

/**
 * Decode URL query params to partial app state
 * Returns only the params that were present in URL
 */
export function decodeStateFromUrl(searchParams: URLSearchParams): Partial<AppState> {
  const state: Partial<AppState> = {}

  // Decode accents
  const accentsParam = searchParams.get('a')
  if (accentsParam) {
    try {
      state.accents = decodeAccents(accentsParam)
    } catch (error) {
      console.warn('Failed to decode accents from URL:', error)
    }
  }

  // Decode rudiment
  const rudimentParam = searchParams.get('r')
  if (rudimentParam) {
    state.rudiment = decodeRudiment(rudimentParam)
  }

  // Decode tempo
  const tempoParam = searchParams.get('t')
  if (tempoParam) {
    const tempo = parseInt(tempoParam, 10)
    if (!isNaN(tempo) && tempo >= 40 && tempo <= 200) {
      state.tempo = tempo
    }
  }

  // Decode metronome
  const metronomeParam = searchParams.get('m')
  if (metronomeParam) {
    state.metronome = metronomeParam === '1'
  }

  // Decode orchestration
  const orchestrationParam = searchParams.get('o')
  if (orchestrationParam) {
    state.instrumentMapping = decodeOrchestration(orchestrationParam)
  }

  return state
}
