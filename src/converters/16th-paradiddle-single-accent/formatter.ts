import type { Sticking, Accent } from '../../types.ts'
import { flipHands } from '../shared/hand-utils.ts'
import { INVALID_TRANSITIONS } from '../shared/quality-evaluator.ts'

const QUARTER_LENGTH = 4

export function formatBar(bar: Sticking[]): string {
  const quarters = []
  for (let i = 0; i < bar.length; i += QUARTER_LENGTH) {
    quarters.push(bar.slice(i, i + QUARTER_LENGTH).join(''))
  }
  return quarters.join(' ')
}

export function shouldCreateMirroredBar(
  bar: Sticking[],
  accentMap8: Accent[]
): boolean {
  const calcDoubles = (str: string) => (str.match(/rr|ll/g) || []).length

  // склеены два такта: обычный + обычный
  const testNonFlippedSequence = bar.join('') + bar.join('')
  // склеены два такта: обычный + перевернутый
  const testFlippedSequence = bar.join('') + flipHands(bar).join('')

  // проверка на невозможные переходы типа: rrr, rR, RR
  const nonFlippedValid = !INVALID_TRANSITIONS.some(transition =>
    testNonFlippedSequence.includes(transition)
  )
  const flippedValid = !INVALID_TRANSITIONS.some(transition =>
    testFlippedSequence.includes(transition)
  )

  // проверка для случая когда последний кик
  if (
    bar
      .map(s => s.toLowerCase())
      .join('')
      .endsWith('rk')
  ) {
    return true
  }

  // Если только flipped проходит валидацию
  if (!nonFlippedValid && flippedValid) {
    return true
  }

  // Если только non-flipped проходит валидацию
  if (nonFlippedValid && !flippedValid) {
    return false
  }

  // Если оба проходят валидацию, сравниваем количество двоек
  if (nonFlippedValid && flippedValid) {
    const nonFlippedDoubles = calcDoubles(testNonFlippedSequence)
    const flippedDoubles = calcDoubles(testFlippedSequence)
    return flippedDoubles > nonFlippedDoubles
  }

  // Если оба не проходят валидацию
  return false
}

export function createFormattedBars(
  bar: Sticking[],
  accentMap8: Accent[]
): string[] {
  const bars = [formatBar(bar)]
  const includeMirrored = shouldCreateMirroredBar(bar, accentMap8)

  if (includeMirrored) {
    const mirroredBar = flipHands(bar)
    bars.push(formatBar(mirroredBar))
  }

  return bars
}
