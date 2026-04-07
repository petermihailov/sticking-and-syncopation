import type { Sticking } from '../types'
import type { NotationData, NoteEvent, NoteGroup, Voice } from '../types/notation'
import { collapseAccentPairs } from './accentCollapse'

function stickingToNoteEvent(sticking: Sticking, index: number): NoteEvent {
  if (sticking === 'k') {
    return { type: 'kick', accent: false, index }
  }
  if (sticking === ' ') {
    return { type: 'rest', accent: false, index }
  }
  const accent = sticking === 'R' || sticking === 'L'
  return { type: 'snare', accent, index }
}

function hasKickInStickings(stickings: readonly Sticking[]): boolean {
  return stickings.some(s => s === 'k')
}

function buildKickVoice(beatCount: number): Voice {
  const groups: NoteGroup[] = Array.from({ length: beatCount }, (_, i) => ({
    notes: [{ type: 'kick' as const, accent: false, index: i }],
  }))
  return { groups, stem: 'down', duration: '4' }
}

function groupNotes(
  events: readonly NoteEvent[],
  groupSize: number,
  tuplet?: { actual: number; normal: number }
): NoteGroup[] {
  const groups: NoteGroup[] = []
  for (let i = 0; i < events.length; i += groupSize) {
    const notes = events.slice(i, i + groupSize)
    groups.push(tuplet ? { notes, tuplet } : { notes })
  }
  return groups
}

/** 16th-note patterns: 4/4, groups of 4 */
export function buildSixteenthNotation(
  stickings: readonly Sticking[]
): NotationData {
  const events = stickings.map((s, i) => stickingToNoteEvent(s, i))
  const snareVoice: Voice = { groups: groupNotes(events, 4), stem: 'up' }

  const voices: Voice[] = hasKickInStickings(stickings)
    ? [snareVoice]
    : [snareVoice, buildKickVoice(4)]

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '16',
    voices,
    repeat: true,
  }
}

/** Восьмые триоли: 4/4, 4 группы по 3 (триоль 3:2) */
export function buildTripletNotation(
  stickings: readonly Sticking[]
): NotationData {
  const events = stickings.map((s, i) => stickingToNoteEvent(s, i))
  const snareVoice: Voice = {
    groups: groupNotes(events, 3, { actual: 3, normal: 2 }),
    stem: 'up',
  }

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '8',
    voices: [snareVoice, buildKickVoice(4)],
    repeat: true,
  }
}

/** Шестнадцатые триоли: 4/4, 4 группы по 6 (секстоль 6:4) */
export function buildSixteenthTripletNotation(
  stickings: readonly Sticking[]
): NotationData {
  const events = stickings.map((s, i) => stickingToNoteEvent(s, i))
  const snareVoice: Voice = {
    groups: groupNotes(events, 6, { actual: 6, normal: 4 }),
    stem: 'up',
  }

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '16',
    voices: [snareVoice, buildKickVoice(4)],
    repeat: true,
  }
}

/** Accent pattern notation: 8th notes in 4/4, collapsed to quarters where possible */
export function buildAccentNotation(checkedItems: boolean[]): NotationData {
  const events: NoteEvent[] = checkedItems.map((checked, i) => ({
    type: checked ? 'snare' : 'rest',
    accent: false,
    index: i,
  }))

  const snareVoice: Voice = { groups: collapseAccentPairs(events), stem: 'up' }

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '8',
    voices: [snareVoice],
    repeat: true,
  }
}
