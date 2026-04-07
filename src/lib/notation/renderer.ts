import {
  Voice,
  VoiceMode,
  Formatter,
  Beam,
  type RenderContext,
  type Tuplet,
  type StaveNote,
} from 'vexflow'
import type { NotationData } from '../../types/notation'
import { CLEF_AND_TIME_SIG_WIDTH } from './constants'
import { buildVoiceNotes } from './voices'
import { createStave } from './stave'

export function renderNotation(
  context: RenderContext,
  notation: NotationData,
  x: number,
  y: number,
  width: number
): void {
  const stave = createStave(context, {
    x,
    y,
    width,
    timeSignature: notation.timeSignature,
    repeat: notation.repeat,
  })

  const vfVoices: Voice[] = []
  const allTuplets: Tuplet[] = []
  const allBeamGroups: StaveNote[][] = []

  for (const voiceData of notation.voices) {
    const duration = voiceData.duration ?? notation.baseDuration
    const result = buildVoiceNotes(voiceData, duration)

    const { top, bottom } = notation.timeSignature
    const voice = new Voice({ numBeats: top, beatValue: bottom })
    voice.setMode(VoiceMode.SOFT)
    voice.addTickables(result.notes)
    vfVoices.push(voice)

    allTuplets.push(...result.tuplets)
    allBeamGroups.push(...result.beamGroups)
  }

  const allBeams: Beam[] = []
  for (const group of allBeamGroups) {
    try {
      allBeams.push(new Beam(group))
    } catch {
      // Skip beams that can't be created
    }
  }

  const formatWidth = width - CLEF_AND_TIME_SIG_WIDTH
  new Formatter().joinVoices(vfVoices).format(vfVoices, formatWidth)

  for (const voice of vfVoices) {
    const tickables = voice.getTickables()
    if (tickables.length === 1) {
      const note = tickables[0]
      note.setXShift(formatWidth / 2)
    }
    voice.draw(context, stave)
  }

  for (const tuplet of allTuplets) {
    tuplet.setContext(context).draw()
  }

  for (const beam of allBeams) {
    beam.setContext(context).draw()
  }
}

export function getStaveHeight(): number {
  return 120
}
