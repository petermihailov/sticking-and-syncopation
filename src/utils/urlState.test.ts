import { describe, it, expect } from 'vitest'
import {
  encodeAccents,
  decodeAccents,
  encodeRudiment,
  decodeRudiment,
  encodeOrchestration,
  decodeOrchestration,
  isDefaultMapping,
  encodeStateToUrl,
  decodeStateFromUrl,
} from './urlState'
import { DEFAULT_STICKING_MAPPING } from '../types/instrument'
import { DEFAULT_APP_STATE } from '../types/appState'
import type { AppState } from '../types/appState'

describe('encodeAccents / decodeAccents', () => {
  it('should encode all false to 00', () => {
    const accents = [false, false, false, false, false, false, false, false]
    expect(encodeAccents(accents)).toBe('00')
  })

  it('should encode all true to FF', () => {
    const accents = [true, true, true, true, true, true, true, true]
    expect(encodeAccents(accents)).toBe('FF')
  })

  it('should encode [true, false, true, false, false, true, false, false] to A4', () => {
    const accents = [true, false, true, false, false, true, false, false]
    expect(encodeAccents(accents)).toBe('A4')
  })

  it('should encode [false, true, false, true, false, true, false, true] to 55', () => {
    const accents = [false, true, false, true, false, true, false, true]
    expect(encodeAccents(accents)).toBe('55')
  })

  it('should encode [true, true, false, false, false, false, true, true] to C3', () => {
    const accents = [true, true, false, false, false, false, true, true]
    expect(encodeAccents(accents)).toBe('C3')
  })

  it('should decode 00 to all false', () => {
    const result = decodeAccents('00')
    expect(result).toEqual([false, false, false, false, false, false, false, false])
  })

  it('should decode FF to all true', () => {
    const result = decodeAccents('FF')
    expect(result).toEqual([true, true, true, true, true, true, true, true])
  })

  it('should decode A4 to [true, false, true, false, false, true, false, false]', () => {
    const result = decodeAccents('A4')
    expect(result).toEqual([true, false, true, false, false, true, false, false])
  })

  it('should round-trip encode then decode', () => {
    const original = [true, false, true, true, false, false, true, false]
    const encoded = encodeAccents(original)
    const decoded = decodeAccents(encoded)
    expect(decoded).toEqual(original)
  })

  it('should throw error for invalid length', () => {
    expect(() => encodeAccents([true, false, true])).toThrow(
      'Accents array must have exactly 8 elements'
    )
  })
})

describe('encodeRudiment / decodeRudiment', () => {
  it('should encode paradiddle_single_accent to ps', () => {
    expect(encodeRudiment('paradiddle_single_accent')).toBe('ps')
  })

  it('should encode paradiddle_double_accent to pd', () => {
    expect(encodeRudiment('paradiddle_double_accent')).toBe('pd')
  })

  it('should encode invert_paradiddle_single_accent to is', () => {
    expect(encodeRudiment('invert_paradiddle_single_accent')).toBe('is')
  })

  it('should encode invert_paradiddle_double_accent to id', () => {
    expect(encodeRudiment('invert_paradiddle_double_accent')).toBe('id')
  })

  it('should encode invert_paradiddle_kick to ik', () => {
    expect(encodeRudiment('invert_paradiddle_kick')).toBe('ik')
  })

  it('should encode hand_to_hand_triplets to h3', () => {
    expect(encodeRudiment('hand_to_hand_triplets')).toBe('h3')
  })

  it('should decode ps to paradiddle_single_accent', () => {
    expect(decodeRudiment('ps')).toBe('paradiddle_single_accent')
  })

  it('should decode h3 to hand_to_hand_triplets', () => {
    expect(decodeRudiment('h3')).toBe('hand_to_hand_triplets')
  })

  it('should decode unknown code to default', () => {
    expect(decodeRudiment('xx')).toBe('paradiddle_single_accent')
  })

  it('should round-trip all rudiment types', () => {
    const rudiments = [
      'paradiddle_single_accent',
      'paradiddle_double_accent',
      'invert_paradiddle_single_accent',
      'invert_paradiddle_double_accent',
      'invert_paradiddle_kick',
      'hand_to_hand_triplets',
    ] as const

    rudiments.forEach(rudiment => {
      const encoded = encodeRudiment(rudiment)
      const decoded = decodeRudiment(encoded)
      expect(decoded).toBe(rudiment)
    })
  })
})

describe('isDefaultMapping', () => {
  it('should return true for default mapping', () => {
    expect(isDefaultMapping(DEFAULT_STICKING_MAPPING)).toBe(true)
  })

  it('should return false for modified uppercaseR', () => {
    const mapping = { ...DEFAULT_STICKING_MAPPING, uppercaseR: 't1HighRegular' as const }
    expect(isDefaultMapping(mapping)).toBe(false)
  })

  it('should return false for modified kick', () => {
    const mapping = { ...DEFAULT_STICKING_MAPPING, uppercaseRKick: true }
    expect(isDefaultMapping(mapping)).toBe(false)
  })
})

describe('encodeOrchestration / decodeOrchestration', () => {
  it('should return null for default mapping', () => {
    const result = encodeOrchestration(DEFAULT_STICKING_MAPPING)
    expect(result).toBeNull()
  })

  it('should encode custom mapping', () => {
    const mapping = {
      uppercaseR: 't1HighRegular' as const,
      uppercaseL: 't2MidRegular' as const,
      lowercaseR: 'hhCloseGhost' as const,
      lowercaseL: 'hhCloseGhost' as const,
      kick: 'kiKickRegular' as const,
      uppercaseRKick: true,
      uppercaseLKick: false,
    }
    const result = encodeOrchestration(mapping)
    expect(result).toBe('t1,t2,hg,hg,ki,1,0')
  })

  it('should decode orchestration string', () => {
    const result = decodeOrchestration('t1,t2,hg,hg,ki,1,0')
    expect(result).toEqual({
      uppercaseR: 't1HighRegular',
      uppercaseL: 't2MidRegular',
      lowercaseR: 'hhCloseGhost',
      lowercaseL: 'hhCloseGhost',
      kick: 'kiKickRegular',
      uppercaseRKick: true,
      uppercaseLKick: false,
    })
  })

  it('should return default for invalid orchestration string', () => {
    const result = decodeOrchestration('invalid')
    expect(result).toEqual(DEFAULT_STICKING_MAPPING)
  })

  it('should round-trip custom mapping', () => {
    const original = {
      uppercaseR: 'cyRideRegular' as const,
      uppercaseL: 'cyCrashRegular' as const,
      lowercaseR: 'snSnareGhost' as const,
      lowercaseL: 'snSnareGhost' as const,
      kick: 'kiKickRegular' as const,
      uppercaseRKick: true,
      uppercaseLKick: true,
    }
    const encoded = encodeOrchestration(original)
    expect(encoded).not.toBeNull()
    const decoded = decodeOrchestration(encoded!)
    expect(decoded).toEqual(original)
  })
})

describe('encodeStateToUrl', () => {
  it('should encode minimal state with defaults', () => {
    const state: AppState = {
      ...DEFAULT_APP_STATE,
      accents: [true, false, true, false, false, true, false, false],
    }
    const result = encodeStateToUrl(state)
    // Should omit default rudiment
    expect(result).toBe('a=A4')
  })

  it('should encode state with tempo', () => {
    const state: AppState = {
      ...DEFAULT_APP_STATE,
      accents: [true, true, true, true, true, true, true, true],
      tempo: 140,
    }
    const result = encodeStateToUrl(state)
    expect(result).toBe('a=FF&t=140')
  })

  it('should encode state with metronome', () => {
    const state: AppState = {
      ...DEFAULT_APP_STATE,
      accents: [false, true, false, true, false, true, false, true],
      metronome: true,
    }
    const result = encodeStateToUrl(state)
    expect(result).toBe('a=55&m=1')
  })

  it('should encode state with custom rudiment', () => {
    const state: AppState = {
      ...DEFAULT_APP_STATE,
      accents: [true, true, false, false, false, false, true, true],
      rudiment: 'hand_to_hand_triplets',
    }
    const result = encodeStateToUrl(state)
    expect(result).toBe('a=C3&r=h3')
  })

  it('should encode full state with orchestration', () => {
    const state: AppState = {
      accents: [true, false, true, false, false, true, false, false],
      rudiment: 'invert_paradiddle_kick',
      tempo: 180,
      metronome: true,
      instrumentMapping: {
        uppercaseR: 'cyRideRegular',
        uppercaseL: 'cyCrashRegular',
        lowercaseR: 'snSnareGhost',
        lowercaseL: 'snSnareGhost',
        kick: 'kiKickRegular',
        uppercaseRKick: true,
        uppercaseLKick: false,
      },
    }
    const result = encodeStateToUrl(state)
    expect(result).toBe('a=A4&r=ik&t=180&m=1&o=rd%2Ccr%2Csg%2Csg%2Cki%2C1%2C0')
  })

  it('should omit orchestration if default', () => {
    const state: AppState = {
      ...DEFAULT_APP_STATE,
      accents: [false, false, false, false, false, false, false, false],
      tempo: 100,
      instrumentMapping: DEFAULT_STICKING_MAPPING,
    }
    const result = encodeStateToUrl(state)
    expect(result).toBe('a=00&t=100')
  })
})

describe('decodeStateFromUrl', () => {
  it('should decode minimal URL', () => {
    const params = new URLSearchParams('a=A4')
    const result = decodeStateFromUrl(params)
    expect(result.accents).toEqual([true, false, true, false, false, true, false, false])
    expect(result.rudiment).toBeUndefined() // Omitted means use default
  })

  it('should decode URL with explicit rudiment', () => {
    const params = new URLSearchParams('a=A4&r=ps')
    const result = decodeStateFromUrl(params)
    expect(result.accents).toEqual([true, false, true, false, false, true, false, false])
    expect(result.rudiment).toBe('paradiddle_single_accent')
  })

  it('should decode URL with tempo', () => {
    const params = new URLSearchParams('a=FF&r=h3&t=140')
    const result = decodeStateFromUrl(params)
    expect(result.accents).toEqual([true, true, true, true, true, true, true, true])
    expect(result.rudiment).toBe('hand_to_hand_triplets')
    expect(result.tempo).toBe(140)
  })

  it('should decode URL with metronome', () => {
    const params = new URLSearchParams('a=55&r=pd&m=1')
    const result = decodeStateFromUrl(params)
    expect(result.metronome).toBe(true)
  })

  it('should decode full URL with orchestration', () => {
    const params = new URLSearchParams('a=C3&r=ik&t=180&m=1&o=rd,cr,sg,sg,ki,1,0')
    const result = decodeStateFromUrl(params)
    expect(result.accents).toEqual([true, true, false, false, false, false, true, true])
    expect(result.rudiment).toBe('invert_paradiddle_kick')
    expect(result.tempo).toBe(180)
    expect(result.metronome).toBe(true)
    expect(result.instrumentMapping).toEqual({
      uppercaseR: 'cyRideRegular',
      uppercaseL: 'cyCrashRegular',
      lowercaseR: 'snSnareGhost',
      lowercaseL: 'snSnareGhost',
      kick: 'kiKickRegular',
      uppercaseRKick: true,
      uppercaseLKick: false,
    })
  })

  it('should return empty object for empty URL', () => {
    const params = new URLSearchParams('')
    const result = decodeStateFromUrl(params)
    expect(result).toEqual({})
  })

  it('should ignore invalid tempo', () => {
    const params = new URLSearchParams('a=00&r=ps&t=invalid')
    const result = decodeStateFromUrl(params)
    expect(result.tempo).toBeUndefined()
  })

  it('should ignore out of range tempo', () => {
    const params = new URLSearchParams('a=00&r=ps&t=300')
    const result = decodeStateFromUrl(params)
    expect(result.tempo).toBeUndefined()
  })

  it('should handle invalid accents gracefully', () => {
    const params = new URLSearchParams('a=ZZ&r=ps')
    const result = decodeStateFromUrl(params)
    // Should return empty accents or skip accents field
    expect(result.rudiment).toBe('paradiddle_single_accent')
  })
})

describe('full round-trip integration', () => {
  it('should preserve state through encode->decode cycle', () => {
    const original: AppState = {
      accents: [true, false, true, true, false, false, true, false],
      rudiment: 'paradiddle_double_accent',
      tempo: 120,
      metronome: true,
      instrumentMapping: {
        uppercaseR: 't1HighRegular',
        uppercaseL: 't2MidRegular',
        lowercaseR: 'hhCloseGhost',
        lowercaseL: 'hhCloseGhost',
        kick: 'kiKickRegular',
        uppercaseRKick: false,
        uppercaseLKick: true,
      },
    }

    const encoded = encodeStateToUrl(original)
    const params = new URLSearchParams(encoded)
    const decoded = decodeStateFromUrl(params)

    expect(decoded.accents).toEqual(original.accents)
    expect(decoded.rudiment).toBe(original.rudiment)
    expect(decoded.tempo).toBe(original.tempo)
    expect(decoded.metronome).toBe(original.metronome)
    expect(decoded.instrumentMapping).toEqual(original.instrumentMapping)
  })

  it('should preserve default state', () => {
    const original: AppState = {
      ...DEFAULT_APP_STATE,
      accents: [false, false, false, false, false, false, false, false],
    }

    const encoded = encodeStateToUrl(original)
    const params = new URLSearchParams(encoded)
    const decoded = decodeStateFromUrl(params)

    expect(decoded.accents).toEqual(original.accents)
    // rudiment, tempo, metronome, orchestration should be omitted from URL
    expect(encoded).not.toContain('r=')
    expect(encoded).not.toContain('t=')
    expect(encoded).not.toContain('m=')
    expect(encoded).not.toContain('o=')
    // Should only contain accents
    expect(encoded).toBe('a=00')
  })
})
