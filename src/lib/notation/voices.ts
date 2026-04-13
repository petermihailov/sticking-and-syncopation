import {
  StaveNote,
  StaveTie,
  Stem,
  Tuplet,
  Articulation,
  Parenthesis,
  GraceNote,
  GraceNoteGroup,
  MetricsDefaults,
} from 'vexflow'

// Уменьшаем размер grace notes (флэмов)
MetricsDefaults.GraceNote = { ...MetricsDefaults.GraceNote, fontScale: 0.6 }
import type { NoteEvent, PlayableType, VoiceData } from '../../types/notation'
import { SNARE_KEY, KICK_KEY, FOOT_HH_KEY } from './constants'

export interface IndexedNote {
  readonly note: StaveNote
  readonly index: number
}

const NOTE_KEY_MAP: Record<PlayableType, string> = {
  kick: KICK_KEY,
  footHH: FOOT_HH_KEY,
  snare: SNARE_KEY,
}

function createRestNote(duration: string): StaveNote {
  const restKey = duration === '1' ? 'd/5' : 'b/4'
  return new StaveNote({ keys: [restKey], duration: `${duration}r` })
}

function createPlayNote(
  event: NoteEvent & { readonly type: PlayableType },
  duration: string,
  stemDir: number
): StaveNote {
  const note = new StaveNote({
    keys: [NOTE_KEY_MAP[event.type]],
    duration,
    stemDirection: stemDir,
  })

  if (event.accent) {
    note.addModifier(new Articulation('a>'))
  }
  if (event.ghost) {
    note.setFontSize(24)
    note.noteHeads.forEach(nh => nh.setFontSize(20))
    Parenthesis.buildAndAttach([note])
  }
  if (event.flam) {
    applyFlamModifier(note)
  }

  return note
}

// Добавляет флэм (grace note + кастомный slur) к ноте.
// Monkey-patching getWidth/draw — хак для VexFlow 5, где нет нативного
// способа управлять размером slur у GraceNoteGroup.
function applyFlamModifier(note: StaveNote): void {
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
    graceGroup.showSlur = false
    origDraw()
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

export function buildVoiceNotes(voiceData: VoiceData, baseDuration: string) {
  const stemDir = voiceData.stem === 'up' ? Stem.UP : Stem.DOWN
  const notes: StaveNote[] = []
  const beamGroups: StaveNote[][] = []
  const tuplets: Tuplet[] = []
  const indexedNotes: IndexedNote[] = []

  for (const group of voiceData.groups) {
    const groupNotes: StaveNote[] = []
    const groupBeamable: StaveNote[] = []
    const effectiveDuration = group.duration ?? baseDuration

    for (const event of group.notes) {
      if (event.type === 'rest') {
        const rest = createRestNote(effectiveDuration)
        groupNotes.push(rest)
        notes.push(rest)
        indexedNotes.push({ note: rest, index: event.index })
        continue
      }

      const note = createPlayNote(
        event as NoteEvent & { readonly type: PlayableType },
        effectiveDuration,
        stemDir
      )
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
