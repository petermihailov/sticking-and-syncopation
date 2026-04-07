import type { NoteEvent, NoteGroup } from '../types/notation'

/**
 * Collapses a sequence of 8th-note events into visually cleaner groups:
 * - snare + rest on "&" → quarter note
 * - two adjacent quarter rests → half rest
 * - full bar of rests → whole rest
 */
export function collapseAccentPairs(events: readonly NoteEvent[]): NoteGroup[] {
  const pairs: NoteGroup[] = []
  for (let i = 0; i < events.length; i += 2) {
    const downbeat = events[i]
    const and = events[i + 1]

    if (!and) {
      pairs.push({ notes: [downbeat] })
      continue
    }

    const bothNotes = downbeat.type === 'snare' && and.type === 'snare'
    const andOnly = downbeat.type === 'rest' && and.type === 'snare'

    if (bothNotes || andOnly) {
      pairs.push({ notes: [downbeat, and] })
    } else {
      pairs.push({ notes: [downbeat], duration: '4' })
    }
  }

  const groups: NoteGroup[] = []
  for (let j = 0; j < pairs.length; j += 2) {
    const first = pairs[j]
    const second = pairs[j + 1]

    if (!second) {
      groups.push(first)
      continue
    }

    const bothQuarterRests =
      first.duration === '4' &&
      first.notes[0].type === 'rest' &&
      second.duration === '4' &&
      second.notes[0].type === 'rest'

    if (bothQuarterRests) {
      groups.push({ notes: [first.notes[0]], duration: '2' })
    } else {
      groups.push(first, second)
    }
  }

  if (
    groups.length === 2 &&
    groups[0].duration === '2' &&
    groups[0].notes[0].type === 'rest' &&
    groups[1].duration === '2' &&
    groups[1].notes[0].type === 'rest'
  ) {
    return [{ notes: [groups[0].notes[0]], duration: '1' }]
  }

  return groups
}
