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

/**
 * Определить stroke types для массива стикингов.
 *
 * Каждая рука обрабатывается независимо: тип удара зависит от
 * динамики текущей и следующей ноты той же руки.
 *
 * @param stickings — массив символов стикинга
 * @param loop — зациклен ли такт (последняя нота руки смотрит на первую)
 */
export function resolveStrokes(
  stickings: Sticking[],
  loop: boolean
): (StrokeType | null)[] {
  const result: (StrokeType | null)[] = new Array(stickings.length).fill(null)

  // Собираем индексы нот для каждой руки (R/r → 'R', L/l → 'L')
  const rightIndices: number[] = []
  const leftIndices: number[] = []

  for (let i = 0; i < stickings.length; i++) {
    const s = stickings[i]
    if (s === 'R' || s === 'r') rightIndices.push(i)
    else if (s === 'L' || s === 'l') leftIndices.push(i)
  }

  resolveHand(stickings, rightIndices, loop, result)
  resolveHand(stickings, leftIndices, loop, result)

  return result
}

// Определить stroke type для всех нот одной руки.
function resolveHand(
  stickings: Sticking[],
  indices: number[],
  loop: boolean,
  result: (StrokeType | null)[]
): void {
  if (indices.length === 0) return

  for (let i = 0; i < indices.length; i++) {
    const current = stickings[indices[i]]
    const accent = isAccent(current)

    // Следующая нота той же руки
    let nextAccent: boolean
    if (i < indices.length - 1) {
      nextAccent = isAccent(stickings[indices[i + 1]])
    } else if (loop) {
      // Зацикливание — смотрим на первую ноту руки
      nextAccent = isAccent(stickings[indices[0]])
    } else {
      // Последняя нота без цикла — конечная позиция не важна
      nextAccent = accent // F если акцент, t если гост
    }

    result[indices[i]] = strokeType(accent, nextAccent)
  }
}

/**
 * Определить stroke types для флэм-грейс-нот.
 *
 * Флэм — всегда гост противоположной рукой, значит `u` или `t`.
 * Тип зависит от следующей ноты руки грейса.
 */
export function resolveFlamStrokes(
  stickings: Sticking[],
  flams: boolean[],
  loop: boolean
): (StrokeType | null)[] {
  const result: (StrokeType | null)[] = new Array(stickings.length).fill(null)

  for (let i = 0; i < stickings.length; i++) {
    if (!flams[i]) continue

    const main = stickings[i]
    if (!isHand(main)) continue

    // Рука грейса — противоположная основному удару
    const graceIsRight = main === 'L' || main === 'l'

    // Ищем следующую ноту руки грейса
    let nextAccent: boolean | null = null
    for (let j = 1; j < stickings.length; j++) {
      const idx = (i + j) % stickings.length
      if (!loop && idx <= i) break
      const s = stickings[idx]
      if (graceIsRight ? s === 'R' || s === 'r' : s === 'L' || s === 'l') {
        nextAccent = isAccent(s)
        break
      }
    }

    // Если нет следующей ноты — t (гост без продолжения)
    result[i] = (nextAccent ?? false) ? 'u' : 't'
  }

  return result
}

// Таблица переходов Мёллера.
function strokeType(accent: boolean, nextAccent: boolean): StrokeType {
  if (accent && nextAccent) return 'F'
  if (accent && !nextAccent) return 'D'
  if (!accent && nextAccent) return 'u'
  return 't'
}
