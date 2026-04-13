import type { Group, Hand } from '../types/instrument'
import type { Bar } from '../types/bar'
import type { InstrumentVoice, StickingMapping } from '../types/sticking'
import { DEFAULT_STICKING_MAPPING } from '../types/sticking'
import {
  EMPTY_RESOLVER_STATE,
  resolveStroke,
} from '../lib/player/StickingResolver'
import type { Sticking, Meter } from '../types'

const DEFAULT_METER: Meter = { beatsPerBar: 4, noteValue: 4, notesPerBeat: 4 }

/**
 * Получить voices для проигрывания на конкретной субдивизии такта,
 * с учётом заглушенных групп инструментов.
 */
export function getVoicesByIndex(
  bar: Bar,
  rhythmIndex: number,
  muted: Group[] = []
): InstrumentVoice[] {
  if (!bar || !bar.rhythm || !Array.isArray(bar.rhythm)) {
    console.warn('Invalid bar provided to getVoicesByIndex')
    return []
  }

  const voices = bar.rhythm[rhythmIndex] ?? []
  return voices.filter(v => {
    const group = v.instrument.substring(0, 2) as Group
    return !muted.includes(group)
  })
}

/**
 * Конвертация sticking-паттерна в Bar для предпросмотра/показа.
 * Использует первое значение в массивах ротации (без счётчиков).
 *
 * Для воспроизведения Player делает свой проход через resolveStroke,
 * чтобы корректно вращать ротацию по такту.
 */
export function stickingToBar(
  stickings: Sticking[],
  mapping: StickingMapping = DEFAULT_STICKING_MAPPING,
  meter: Meter = DEFAULT_METER,
  flams?: boolean[]
): Bar {
  const rhythm: InstrumentVoice[][] = []
  const stickingSymbols: Sticking[] = []
  const hands: Hand[] = []

  // Локальное состояние ротации — нужно только чтобы получить «первый» voice
  // на каждом ударе. Player всё равно пересчитает с собственным состоянием.
  let state = EMPTY_RESOLVER_STATE

  stickings.forEach(char => {
    stickingSymbols.push(char)

    if (char === ' ') {
      rhythm.push([])
      hands.push(null)
      return
    }

    const result = resolveStroke(char, mapping, state)
    state = result.nextState
    rhythm.push(result.voices)

    // Рука нужна только для подсветки нот ghost-стикингов.
    hands.push(char === 'r' ? 'r' : char === 'l' ? 'l' : null)
  })

  return {
    rhythm,
    stickings: stickingSymbols,
    hands,
    flams,
    beatsPerBar: meter.beatsPerBar,
    noteValue: meter.noteValue,
    timeDivision: meter.notesPerBeat,
  }
}

export function stickingsToBars(
  stickingPatterns: Sticking[][],
  mapping?: StickingMapping,
  meter?: Meter,
  flams?: boolean[][]
): Bar[] {
  return stickingPatterns.map((pattern, i) =>
    stickingToBar(pattern, mapping, meter, flams?.[i])
  )
}

/**
 * Принадлежит ли инструмент группе (для фильтра muted).
 */
export function instrumentBelongsToGroup(
  instrument: string,
  group: Group
): boolean {
  return instrument.startsWith(group)
}
