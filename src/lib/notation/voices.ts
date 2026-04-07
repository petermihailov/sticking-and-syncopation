import { StaveNote, Tuplet, Beam, Articulation } from 'vexflow'
import type { Voice as VoiceData } from '../../types/notation'
import { SNARE_KEY, KICK_KEY, FOOT_HH_KEY } from './constants'

export function buildVoiceNotes(voiceData: VoiceData, baseDuration: string) {
  const stemDir = voiceData.stem === 'up' ? 1 : -1
  const notes: StaveNote[] = []
  const beamGroups: StaveNote[][] = []
  const tuplets: Tuplet[] = []

  for (const group of voiceData.groups) {
    const groupNotes: StaveNote[] = []
    const groupBeamable: StaveNote[] = []
    const effectiveDuration = group.duration ?? baseDuration

    for (const event of group.notes) {
      if (event.type === 'rest') {
        const restKey = effectiveDuration === '1' ? 'd/5' : 'b/4'
        const rest = new StaveNote({
          keys: [restKey],
          duration: `${effectiveDuration}r`,
        })
        groupNotes.push(rest)
        notes.push(rest)
        continue
      }

      const keyMap = { kick: KICK_KEY, footHH: FOOT_HH_KEY, snare: SNARE_KEY }
      const key = keyMap[event.type]
      const note = new StaveNote({
        keys: [key],
        duration: effectiveDuration,
        stemDirection: stemDir,
      })

      if (event.accent) {
        note.addModifier(new Articulation('a>'))
      }

      groupNotes.push(note)
      notes.push(note)
      groupBeamable.push(note)

    }

    if (group.tuplet) {
      tuplets.push(
        new Tuplet(groupNotes, {
          numNotes: group.tuplet.actual,
          notesOccupied: group.tuplet.normal,
        })
      )
    }

    if (groupBeamable.length > 1) {
      beamGroups.push(groupBeamable)
    }
  }

  return { notes, tuplets, beamGroups }
}
