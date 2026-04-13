import type { Sticking } from '../../types'
import type {
  NotationData,
  NoteEvent,
  NoteGroup,
  VoiceData,
} from '../../types/notation'
import { collapseAccentPairs } from './accentCollapse'

interface RhythmConfig {
  baseDuration: '4' | '8' | '16'
  groupSize: number
  tuplet?: { actual: number; normal: number }
  /** Не-акцентные snare автоматически становятся ghost (по умолчанию true) */
  autoGhost?: boolean
}

function stickingToNoteEvent(
  sticking: Sticking,
  index: number,
  flam = false,
  autoGhost = true
): NoteEvent {
  if (sticking === 'k') {
    return { type: 'kick', accent: false, ghost: false, flam: false, index }
  }
  if (sticking === ' ') {
    return { type: 'rest', accent: false, ghost: false, flam: false, index }
  }
  const accent = sticking === 'R' || sticking === 'L'
  const ghost = autoGhost && !accent
  return { type: 'snare', accent, ghost, flam, index }
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

function buildNotation(
  stickings: readonly Sticking[],
  config: RhythmConfig,
  flams?: readonly boolean[]
): NotationData {
  const autoGhost = config.autoGhost ?? true
  const events = stickings.map((s, i) =>
    stickingToNoteEvent(s, i, flams?.[i], autoGhost)
  )
  const snareVoice: VoiceData = {
    groups: groupNotes(events, config.groupSize, config.tuplet),
    stem: 'up',
  }
  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: config.baseDuration,
    voices: [snareVoice],
    repeat: true,
  }
}

/** 16th-note patterns: 4/4, группы по 4 */
export function buildSixteenthNotation(
  stickings: readonly Sticking[],
  flams?: readonly boolean[]
): NotationData {
  return buildNotation(stickings, { baseDuration: '16', groupSize: 4 }, flams)
}

/** Восьмые триоли: 4/4, 4 группы по 3 (триоль 3:2) */
export function buildTripletNotation(
  stickings: readonly Sticking[],
  flams?: readonly boolean[]
): NotationData {
  return buildNotation(
    stickings,
    { baseDuration: '8', groupSize: 3, tuplet: { actual: 3, normal: 2 } },
    flams
  )
}

/** Шестнадцатые триоли: 4/4, 4 группы по 6 (секстоль 6:4) */
export function buildSixteenthTripletNotation(
  stickings: readonly Sticking[],
  flams?: readonly boolean[]
): NotationData {
  return buildNotation(
    stickings,
    { baseDuration: '16', groupSize: 6, tuplet: { actual: 6, normal: 4 } },
    flams
  )
}

/** Accent pattern: восьмые в 4/4, свёрнутые в четверти где возможно */
export function buildAccentNotation(checkedItems: boolean[]): NotationData {
  const events: NoteEvent[] = checkedItems.map((checked, i) => ({
    type: checked ? 'snare' : 'rest',
    accent: false,
    ghost: false,
    flam: false,
    index: i,
  }))

  const snareVoice: VoiceData = {
    groups: collapseAccentPairs(events),
    stem: 'up',
  }

  return {
    timeSignature: { top: 4, bottom: 4 },
    baseDuration: '8',
    voices: [snareVoice],
    repeat: true,
  }
}
