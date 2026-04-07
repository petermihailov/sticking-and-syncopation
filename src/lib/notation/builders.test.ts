import { describe, it, expect } from 'vitest'
import { buildAccentNotation } from './builders'

describe('buildAccentNotation', () => {
  it('all 8 accents → 8 eighth-note snares in 4 groups of 2', () => {
    const result = buildAccentNotation([true, true, true, true, true, true, true, true])
    expect(result.voices).toHaveLength(1)
    const groups = result.voices[0].groups
    expect(groups).toHaveLength(4)
    for (const g of groups) {
      expect(g.notes).toHaveLength(2)
      expect(g.notes.every(n => n.type === 'snare')).toBe(true)
    }
  })

  it('no accents → single whole rest', () => {
    const result = buildAccentNotation([false, false, false, false, false, false, false, false])
    const groups = result.voices[0].groups
    expect(groups).toHaveLength(1)
    expect(groups[0].notes[0].type).toBe('rest')
    expect(groups[0].duration).toBe('1')
  })

  it('downbeat only (e.g. [true, false, ...]) → quarter note + rest pair', () => {
    const result = buildAccentNotation([true, false, false, false, false, false, false, false])
    const groups = result.voices[0].groups
    // First pair: snare downbeat, rest "&" → collapses to quarter snare
    expect(groups[0].notes).toHaveLength(1)
    expect(groups[0].notes[0].type).toBe('snare')
    expect(groups[0].duration).toBe('4')
  })

  it('and-only (e.g. [false, true, ...]) → rest + snare pair', () => {
    const result = buildAccentNotation([false, true, false, false, false, false, false, false])
    const groups = result.voices[0].groups
    // First pair: rest downbeat + snare "&" → keeps both eighths
    expect(groups[0].notes).toHaveLength(2)
    expect(groups[0].notes[0].type).toBe('rest')
    expect(groups[0].notes[1].type).toBe('snare')
  })

  it('two adjacent rest pairs collapse to half rest', () => {
    // beats 1-4 all off → two quarter rests → one half rest
    const result = buildAccentNotation([false, false, false, false, true, true, true, true])
    const groups = result.voices[0].groups
    expect(groups[0].notes[0].type).toBe('rest')
    expect(groups[0].duration).toBe('2')
  })

  it('alternating on/off pattern', () => {
    const result = buildAccentNotation([true, false, true, false, true, false, true, false])
    const groups = result.voices[0].groups
    // Each pair: snare + rest → quarter note
    for (const g of groups) {
      expect(g.notes).toHaveLength(1)
      expect(g.notes[0].type).toBe('snare')
      expect(g.duration).toBe('4')
    }
  })

  it('metadata is correct', () => {
    const result = buildAccentNotation([true, false, true, false, true, false, true, false])
    expect(result.timeSignature).toEqual({ top: 4, bottom: 4 })
    expect(result.baseDuration).toBe('8')
    expect(result.repeat).toBe(true)
  })
})
