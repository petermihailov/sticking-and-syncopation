import { describe, it, expect } from 'vitest'
import { buildVoiceNotes } from './voices'
import type { Voice } from '../../types/notation'
import { SNARE_KEY, KICK_KEY, FOOT_HH_KEY } from './constants'

function snare(index: number, accent = false) {
  return { type: 'snare' as const, accent, ghost: false, flam: false, index }
}

function kick(index: number) {
  return { type: 'kick' as const, accent: false, ghost: false, flam: false, index }
}

function footHH(index: number) {
  return { type: 'footHH' as const, accent: false, ghost: false, flam: false, index }
}

function rest(index: number) {
  return { type: 'rest' as const, accent: false, ghost: false, flam: false, index }
}

describe('buildVoiceNotes', () => {
  it('maps snare to correct key', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [snare(0)] }],
    }
    const { notes } = buildVoiceNotes(voice, '8')
    expect(notes).toHaveLength(1)
    expect(notes[0].getKeys()).toEqual([SNARE_KEY])
  })

  it('maps kick to correct key', () => {
    const voice: Voice = {
      stem: 'down',
      groups: [{ notes: [kick(0)] }],
    }
    const { notes } = buildVoiceNotes(voice, '8')
    expect(notes[0].getKeys()).toEqual([KICK_KEY])
  })

  it('maps footHH to correct key', () => {
    const voice: Voice = {
      stem: 'down',
      groups: [{ notes: [footHH(0)] }],
    }
    const { notes } = buildVoiceNotes(voice, '8')
    expect(notes[0].getKeys()).toEqual([FOOT_HH_KEY])
  })

  it('creates rest notes with r suffix', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [rest(0)] }],
    }
    const { notes } = buildVoiceNotes(voice, '8')
    expect(notes[0].isRest()).toBe(true)
    expect(notes[0].getDuration()).toBe('8')
  })

  it('whole rest uses d/5 key', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [rest(0)], duration: '1' }],
    }
    const { notes } = buildVoiceNotes(voice, '8')
    expect(notes[0].getKeys()).toEqual(['d/5'])
  })

  it('adds accent articulation', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [snare(0, true)] }],
    }
    const { notes } = buildVoiceNotes(voice, '8')
    expect(notes[0].getModifiers().length).toBeGreaterThan(0)
  })

  it('no accent → no modifiers', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [snare(0, false)] }],
    }
    const { notes } = buildVoiceNotes(voice, '8')
    expect(notes[0].getModifiers()).toHaveLength(0)
  })

  it('creates beam groups for multiple beamable notes', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [snare(0), snare(1), snare(2), snare(3)] }],
    }
    const { beamGroups } = buildVoiceNotes(voice, '16')
    expect(beamGroups).toHaveLength(1)
    expect(beamGroups[0]).toHaveLength(4)
  })

  it('single note group does not create beam', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [snare(0)] }],
    }
    const { beamGroups } = buildVoiceNotes(voice, '8')
    expect(beamGroups).toHaveLength(0)
  })

  it('creates tuplets when specified', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [
        {
          notes: [snare(0), snare(1), snare(2)],
          tuplet: { actual: 3, normal: 2 },
        },
      ],
    }
    const { tuplets } = buildVoiceNotes(voice, '8')
    expect(tuplets).toHaveLength(1)
  })

  it('uses group duration over base duration', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [snare(0)], duration: '4' }],
    }
    const { notes } = buildVoiceNotes(voice, '16')
    expect(notes[0].getDuration()).toBe('4')
  })

  it('rests are not added to beam groups', () => {
    const voice: Voice = {
      stem: 'up',
      groups: [{ notes: [snare(0), rest(1), snare(2)] }],
    }
    const { beamGroups } = buildVoiceNotes(voice, '8')
    expect(beamGroups).toHaveLength(1)
    expect(beamGroups[0]).toHaveLength(2) // only the 2 snares
  })
})
