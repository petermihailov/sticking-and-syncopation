import type { Sticking } from '../../types'

// Тип удара по технике Мёллера.
// Регистр отражает динамику (как R/L/r/l в стикингах):
//   F/D — акцентированные (палочка стартует сверху)
//   u/t — тихие (палочка стартует снизу)
export type StrokeType = 'F' | 'D' | 'u' | 't'

// Акцент ли символ стикинга (R/L — да, r/l — нет).
function isAccent(s: string): boolean {
  return s === 'R' || s === 'L'
}

// Принадлежит ли символ руке (R/r или L/l). Кик, рест — нет.
function isHand(s: string): boolean {
  return s === 'R' || s === 'r' || s === 'L' || s === 'l'
}

// Событие руки в unified-последовательности.
interface HandEvent {
  position: number // индекс в массиве stickings
  accent: boolean // акцентированный удар?
  isGrace: boolean // грейс-нота флэма?
}

/**
 * Единый резолвер stroke types для основных нот и флэм-грейсов.
 *
 * Строит полную последовательность событий каждой руки
 * (грейс-ноты + основные ноты в хронологическом порядке)
 * и определяет тип удара по таблице переходов Мёллера.
 */
export function resolveAllStrokes(opts: {
  stickings: Sticking[]
  flams?: boolean[]
  loop: boolean
}): { strokes: (StrokeType | null)[]; flamStrokes: (StrokeType | null)[] } {
  const { stickings, flams, loop } = opts
  const strokes: (StrokeType | null)[] = new Array(stickings.length).fill(null)
  const flamStrokes: (StrokeType | null)[] = new Array(stickings.length).fill(
    null
  )

  // Собираем события каждой руки в хронологическом порядке.
  // Грейс-нота идёт ДО основной ноты на той же позиции.
  const rightEvents: HandEvent[] = []
  const leftEvents: HandEvent[] = []

  for (let i = 0; i < stickings.length; i++) {
    const s = stickings[i]

    // Грейс флэма — гост противоположной рукой
    if (flams?.[i] && isHand(s)) {
      const graceIsRight = s === 'L' || s === 'l'
      const event: HandEvent = { position: i, accent: false, isGrace: true }
      if (graceIsRight) rightEvents.push(event)
      else leftEvents.push(event)
    }

    // Основная нота
    if (s === 'R' || s === 'r') {
      rightEvents.push({ position: i, accent: isAccent(s), isGrace: false })
    } else if (s === 'L' || s === 'l') {
      leftEvents.push({ position: i, accent: isAccent(s), isGrace: false })
    }
  }

  resolveHandEvents(rightEvents, loop, strokes, flamStrokes)
  resolveHandEvents(leftEvents, loop, strokes, flamStrokes)

  return { strokes, flamStrokes }
}

// Резолвим stroke types для событий одной руки.
function resolveHandEvents(
  events: HandEvent[],
  loop: boolean,
  strokes: (StrokeType | null)[],
  flamStrokes: (StrokeType | null)[]
): void {
  if (events.length === 0) return

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const accent = event.accent

    // Следующее событие той же руки
    let nextAccent: boolean
    if (i < events.length - 1) {
      nextAccent = events[i + 1].accent
    } else if (loop) {
      nextAccent = events[0].accent
    } else {
      // Последнее событие без цикла — конечная позиция не важна
      nextAccent = accent
    }

    const type = strokeType(accent, nextAccent)
    if (event.isGrace) {
      flamStrokes[event.position] = type
    } else {
      strokes[event.position] = type
    }
  }
}

/**
 * Определить stroke types для массива стикингов (без учёта флэмов).
 * Обёртка над resolveAllStrokes для обратной совместимости.
 */
export function resolveStrokes(
  stickings: Sticking[],
  loop: boolean
): (StrokeType | null)[] {
  return resolveAllStrokes({ stickings, loop }).strokes
}

// Таблица переходов Мёллера.
function strokeType(accent: boolean, nextAccent: boolean): StrokeType {
  if (accent && nextAccent) return 'F'
  if (accent && !nextAccent) return 'D'
  if (!accent && nextAccent) return 'u'
  return 't'
}
