import { drumRudiments } from '../../replaces.ts'
import { SPECIAL_PATTERNS } from '../../constants.ts'
import type { Accent, Sticking } from '../../../types.ts'
import {
  findBestPattern,
  selectNonAccentedPattern,
} from '../strategies/pattern-selector.ts'
import { isCapitalLetter } from '../utils/pattern-utils.ts'
import { appendPatternToResult } from '../utils/pattern-utils.ts'

export type RudimentType =
  | 'paradiddle_single_accent'
  | 'paradiddle_double_accent'
  | 'invert_paradiddle_single_accent'
  | 'invert_paradiddle_double_accent'

export function generateRawBar(
  accentMap8: Accent[],
  rudimentType: RudimentType
): Sticking[] {
  const specialPattern = getSpecialPattern(accentMap8, rudimentType)
  if (specialPattern) {
    return specialPattern
  }

  return generateStandardBar(accentMap8, rudimentType)
}

function getSpecialPattern(
  accentMap8: Accent[],
  rudimentType: RudimentType
): Sticking[] | null {
  if (rudimentType !== 'invert_paradiddle_double_accent') {
    return null
  }

  const isAllZeros = accentMap8.every(accent => accent === 0)
  const isAllOnes = accentMap8.every(accent => accent === 1)

  if (isAllZeros) return SPECIAL_PATTERNS.ALL_ZEROS_INVERT_DOUBLE
  if (isAllOnes) return SPECIAL_PATTERNS.ALL_ONES_INVERT_DOUBLE

  return null
}

function generateStandardBar(
  accentMap8: Accent[],
  rudimentType: RudimentType
): Sticking[] {
  const result: Sticking[] = []
  const rudiment = drumRudiments[rudimentType]

  for (let i = 0; i < 8; i++) {
    const accentLevel = accentMap8[i] === 1 ? '1' : '0'
    const availablePatterns = rudiment[accentLevel]

    const chosenPattern = selectBestPatternFromArray(
      result,
      availablePatterns,
      rudimentType,
      i,
      accentMap8
    )
    appendPatternToResult(result, chosenPattern)
  }

  return result
}

function selectBestPatternFromArray(
  result: Sticking[],
  patterns: string[],
  rudimentType: RudimentType,
  currentPosition: number,
  accentMap: Accent[]
): string {
  if (rudimentType === 'invert_paradiddle_double_accent') {
    const currentAccent = accentMap[currentPosition]
    const isLastPosition = currentPosition === accentMap.length - 1
    const nextAccent = accentMap[isLastPosition ? 0 : currentPosition + 1]

    if (currentAccent === 1) {
      // Иначе используем обычную логику для акцентных позиций
    }

    if (currentAccent === 0) {
      // Если следующий удар акцентный, выбираем паттерн с заглавной буквой на конце
      if (nextAccent === 1) {
        const patternsWithCapitalEnd = patterns.filter(pattern =>
          isCapitalLetter(pattern[pattern.length - 1])
        )
        if (patternsWithCapitalEnd.length > 0) {
          return findBestPattern(result, patternsWithCapitalEnd)
        }
      }

      return selectNonAccentedPattern(
        result,
        patterns,
        currentPosition,
        accentMap
      )
    }
  }

  return findBestPattern(result, patterns)
}
