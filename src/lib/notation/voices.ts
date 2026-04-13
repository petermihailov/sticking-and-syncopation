import {
  StaveNote,
  StaveTie,
  Tuplet,
  Articulation,
  Parenthesis,
  GraceNote,
  GraceNoteGroup,
  MetricsDefaults,
} from 'vexflow'

// Уменьшаем размер grace notes (флэмов)
MetricsDefaults.GraceNote = { ...MetricsDefaults.GraceNote, fontScale: 0.6 }
import type { Voice as VoiceData } from '../../types/notation'
import { SNARE_KEY, KICK_KEY, FOOT_HH_KEY } from './constants'

export interface IndexedNote {
  readonly note: StaveNote
  readonly index: number
}

export function buildVoiceNotes(voiceData: VoiceData, baseDuration: string) {
  const stemDir = voiceData.stem === 'up' ? 1 : -1
  const notes: StaveNote[] = []
  const beamGroups: StaveNote[][] = []
  const tuplets: Tuplet[] = []
  // Маппинг noteIndex (из NoteEvent) → StaveNote — для подсветки во время
  // воспроизведения. Включает и паузы: подсветка их может пропускать.
  const indexedNotes: IndexedNote[] = []

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
        indexedNotes.push({ note: rest, index: event.index })
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
      if (event.ghost) {
        // Уменьшаем размер ghost нот
        note.setFontSize(24)
        note.noteHeads.forEach(nh => nh.setFontSize(20))
        Parenthesis.buildAndAttach([note])
      }
      if (event.flam) {
        const grace = new GraceNote({
          keys: [SNARE_KEY],
          duration: '8',
          slash: true,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const graceGroup = new GraceNoteGroup([grace], true) as any
        // Сужаем ширину grace group, чтобы флэм был ближе к основной ноте
        const origGetWidth = graceGroup.getWidth.bind(graceGroup)
        graceGroup.getWidth = () => Math.max(0, origGetWidth() - 12)
        // Уменьшаем размер slur (улыбочки) — перехватываем draw
        const origDraw = graceGroup.draw.bind(graceGroup)
        graceGroup.draw = () => {
          // Отключаем showSlur чтобы origDraw не рисовал дефолтный slur
          graceGroup.showSlur = false
          origDraw()
          // Рисуем slur вручную с уменьшенными параметрами
          const ctx = graceGroup.checkContext()
          const attachedNote = graceGroup.checkAttachedNote()
          const tie = new StaveTie({
            lastNote: grace,
            firstNote: attachedNote,
            firstIndexes: [0],
            lastIndexes: [0],
          })
          tie.renderOptions.cp1 = 2
          tie.renderOptions.cp2 = 6
          tie.renderOptions.yShift = 7
          tie.renderOptions.firstXShift = -6
          tie.renderOptions.lastXShift = 3
          tie.setContext(ctx).draw()
        }
        note.addModifier(graceGroup)
      }

      groupNotes.push(note)
      notes.push(note)
      groupBeamable.push(note)
      indexedNotes.push({ note, index: event.index })
    }

    if (group.tuplet) {
      tuplets.push(
        new Tuplet(groupNotes, {
          numNotes: group.tuplet.actual,
          notesOccupied: group.tuplet.normal,
          ratioed: false,
          location: -1,
        })
      )
    }

    if (groupBeamable.length > 1) {
      beamGroups.push(groupBeamable)
    }
  }

  return { notes, tuplets, beamGroups, indexedNotes }
}
