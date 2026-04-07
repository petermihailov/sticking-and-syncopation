import {
  Voice,
  VoiceMode,
  Formatter,
  Beam,
  Stave,
  Barline,
  type RenderContext,
  type Tuplet,
  type StaveNote,
} from 'vexflow'
import type { NotationData } from '../../types/notation'
import { buildVoiceNotes } from './voices'
import { createStave } from './stave'

// Запас справа после последней ноты до правой барлайны
const RIGHT_PADDING = 10

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
    const duration = voiceData.duration ?? notation.baseDuration
    const result = buildVoiceNotes(voiceData, duration)

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

// Создаёт стан только ради измерения noteStartX/noteEndX оверхеда
// (клеф + timesig + repeat-барлайны). Контекст не нужен для этих метрик.
function measureStaveOverhead(notation: NotationData): {
  leftOverhead: number
  rightOverhead: number
} {
  const probe = new Stave(0, 0, 500)
  probe.addClef('percussion')
  probe.addTimeSignature(
    `${notation.timeSignature.top}/${notation.timeSignature.bottom}`
  )
  if (notation.repeat) {
    probe.setBegBarType(Barline.type.REPEAT_BEGIN)
    probe.setEndBarType(Barline.type.REPEAT_END)
  }
  const leftOverhead = probe.getNoteStartX() - probe.getX()
  const rightOverhead = probe.getX() + probe.getWidth() - probe.getNoteEndX()
  return { leftOverhead, rightOverhead }
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
): void {
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
}

export function getStaveHeight(): number {
  return 120
}
