import type { Sticking } from '../../types'
import type {
  NotationData,
  NoteEvent,
  NoteGroup,
  Voice,
} from '../../types/notation'
import { collapseAccentPairs } from './accentCollapse'

function stickingToNoteEvent(
  sticking: Sticking,
  index: number,
  flam = false
): NoteEvent {
  if (sticking === 'k') {
    return { type: 'kick', accent: false, ghost: false, flam: false, index }
  }
  if (sticking === ' ') {
    return { type: 'rest', accent: false, ghost: false, flam: false, index }
  }
  const accent = sticking === 'R' || sticking === 'L'
  // Все не-акцентные ноты на малом в play-нотации — ghost.
  return { type: 'snare', accent, ghost: !accent, flam, index }
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
  stickings: readonly Sticking[],
  flams?: readonly boolean[]
): NotationData {
  const events = stickings.map((s, i) => stickingToNoteEvent(s, i, flams?.[i]))
  const snareVoice: Voice = { groups: groupNotes(events, 4), stem: 'up' }

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '16',
    voices: [snareVoice],
    repeat: true,
  }
}

/** Восьмые триоли: 4/4, 4 группы по 3 (триоль 3:2) */
export function buildTripletNotation(
  stickings: readonly Sticking[],
  flams?: readonly boolean[]
): NotationData {
  const events = stickings.map((s, i) => stickingToNoteEvent(s, i, flams?.[i]))
  const snareVoice: Voice = {
    groups: groupNotes(events, 3, { actual: 3, normal: 2 }),
    stem: 'up',
  }

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '8',
    voices: [snareVoice],
    repeat: true,
  }
}

/** Шестнадцатые триоли: 4/4, 4 группы по 6 (секстоль 6:4) */
export function buildSixteenthTripletNotation(
  stickings: readonly Sticking[],
  flams?: readonly boolean[]
): NotationData {
  const events = stickings.map((s, i) => stickingToNoteEvent(s, i, flams?.[i]))
  const snareVoice: Voice = {
    groups: groupNotes(events, 6, { actual: 6, normal: 4 }),
    stem: 'up',
  }

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '16',
    voices: [snareVoice],
    repeat: true,
  }
}

/** Accent pattern notation: 8th notes in 4/4, collapsed to quarters where possible */
export function buildAccentNotation(checkedItems: boolean[]): NotationData {
  const events: NoteEvent[] = checkedItems.map((checked, i) => ({
    type: checked ? 'snare' : 'rest',
    accent: false,
    ghost: false,
    flam: false,
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
