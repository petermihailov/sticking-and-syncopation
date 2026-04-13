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
import { buildVoiceNotes } from './voices'
import { createStave, createProbeStave } from './stave'

// Запас справа после последней ноты до правой барлайны
const RIGHT_PADDING = 10

/** X-позиции нот в SVG-координатах + общая ширина SVG */
export interface NotePositions {
  /** X-координата центра каждой ноты (индекс = noteIndex) */
  xs: number[]
  /** Полная ширина SVG (для перевода в проценты) */
  svgWidth: number
}

interface BuiltVoices {
  vfVoices: Voice[]
  tuplets: Tuplet[]
  beams: Beam[]
  indexedNotes: Array<{ note: StaveNote; index: number }>
}

function buildVoices(notation: NotationData): BuiltVoices {
  const vfVoices: Voice[] = []
  const allTuplets: Tuplet[] = []
  const allBeamGroups: StaveNote[][] = []
  const allIndexedNotes: Array<{ note: StaveNote; index: number }> = []

  for (const voiceData of notation.voices) {
    const result = buildVoiceNotes(voiceData, notation.baseDuration)

    const { top, bottom } = notation.timeSignature
    const voice = new Voice({ numBeats: top, beatValue: bottom })
    voice.setMode(VoiceMode.SOFT)
    voice.addTickables(result.notes)
    vfVoices.push(voice)

    allTuplets.push(...result.tuplets)
    allBeamGroups.push(...result.beamGroups)
    allIndexedNotes.push(...result.indexedNotes)
  }

  const beams: Beam[] = []
  for (const group of allBeamGroups) {
    try {
      beams.push(new Beam(group))
    } catch {
      // пропускаем группы, для которых нельзя построить балку
    }
  }

  return { vfVoices, tuplets: allTuplets, beams, indexedNotes: allIndexedNotes }
}

function measureStaveOverhead(notation: NotationData): {
  leftOverhead: number
  rightOverhead: number
} {
  const probe = createProbeStave({
    timeSignature: notation.timeSignature,
    repeat: notation.repeat,
  })
  const leftOverhead = probe.getNoteStartX() - probe.getX()
  const rightOverhead = probe.getX() + probe.getWidth() - probe.getNoteEndX()
  return { leftOverhead, rightOverhead }
}

/** Собирает X-позиции нот после форматирования */
function collectNotePositions(
  indexedNotes: Array<{ note: StaveNote; index: number }>,
  svgWidth: number
): NotePositions {
  const xs: number[] = []
  for (const { note, index } of indexedNotes) {
    // getAbsoluteX() — левый край нотной головки, добавляем половину ширины глифа
    xs[index] = note.getAbsoluteX() + note.getGlyphWidth() / 2
  }
  return { xs, svgWidth }
}

// Считает минимальную ширину стана для нотации (без контекста рендера)
export function measureNotationWidth(notation: NotationData): number {
  const { vfVoices } = buildVoices(notation)
  const minNotesWidth = new Formatter()
    .joinVoices(vfVoices)
    .preCalculateMinTotalWidth(vfVoices)
  const { leftOverhead, rightOverhead } = measureStaveOverhead(notation)
  return Math.ceil(leftOverhead + minNotesWidth + RIGHT_PADDING + rightOverhead)
}

export function renderNotation(
  context: RenderContext,
  notation: NotationData,
  x: number,
  y: number,
  width: number
): NotePositions {
  const stave = createStave(context, {
    x,
    y,
    width,
    timeSignature: notation.timeSignature,
    repeat: notation.repeat,
  })

  const { vfVoices, tuplets, beams, indexedNotes } = buildVoices(notation)

  new Formatter().joinVoices(vfVoices).formatToStave(vfVoices, stave)

  for (const voice of vfVoices) {
    const tickables = voice.getTickables()
    if (tickables.length === 1) {
      const note = tickables[0]
      note.setXShift((stave.getNoteEndX() - stave.getNoteStartX()) / 2)
    }
    voice.draw(context, stave)
  }

  for (const tuplet of tuplets) {
    tuplet.setContext(context).draw()
  }

  for (const beam of beams) {
    beam.setContext(context).draw()
  }

  // Проставляем data-note-index на SVG-группах уже отрисованных нот —
  // по этому атрибуту компонент подсветит текущую ноту во время воспроизведения.
  for (const { note, index } of indexedNotes) {
    const el = note.getSVGElement?.() as SVGElement | undefined
    el?.setAttribute('data-note-index', String(index))
  }

  return collectNotePositions(indexedNotes, width + x * 2)
}

/** Измеряет ширину и рендерит нотацию за один проход (один buildVoices). */
export function measureAndRender(
  context: RenderContext,
  notation: NotationData,
  x: number,
  y: number,
  widthScale: number
): { width: number; notePositions: NotePositions } {
  const { vfVoices, tuplets, beams, indexedNotes } = buildVoices(notation)
  const { leftOverhead, rightOverhead } = measureStaveOverhead(notation)

  const formatter = new Formatter().joinVoices(vfVoices)
  const minNotesWidth = formatter.preCalculateMinTotalWidth(vfVoices)
  const measuredWidth = Math.ceil(
    leftOverhead + minNotesWidth + RIGHT_PADDING + rightOverhead
  )
  const width = Math.ceil(measuredWidth * widthScale)

  const stave = createStave(context, {
    x,
    y,
    width,
    timeSignature: notation.timeSignature,
    repeat: notation.repeat,
  })

  formatter.formatToStave(vfVoices, stave)

  for (const voice of vfVoices) {
    const tickables = voice.getTickables()
    if (tickables.length === 1) {
      const note = tickables[0]
      note.setXShift((stave.getNoteEndX() - stave.getNoteStartX()) / 2)
    }
    voice.draw(context, stave)
  }

  for (const tuplet of tuplets) {
    tuplet.setContext(context).draw()
  }

  for (const beam of beams) {
    beam.setContext(context).draw()
  }

  for (const { note, index } of indexedNotes) {
    const el = note.getSVGElement?.() as SVGElement | undefined
    el?.setAttribute('data-note-index', String(index))
  }

  const svgWidth = width + x * 2
  return { width, notePositions: collectNotePositions(indexedNotes, svgWidth) }
}

export const STAVE_HEIGHT = 120
