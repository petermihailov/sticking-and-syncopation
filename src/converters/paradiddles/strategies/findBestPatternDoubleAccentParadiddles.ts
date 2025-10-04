import type { Accent, Sticking, StickingPattern } from '../../../types.ts'
import { BAR_LENGTH } from '../../constants.ts'
import { findBestPattern } from './findBestPattern.ts'

type FindBestPatternDoubleAccentParadiddlesArgs = {
  result: Sticking[]
  patterns: StickingPattern[]
  currentIndex: number
  accentMap8: Accent[]
}

export function findBestPatternDoubleAccentParadiddles({
  result,
  patterns,
  accentMap8,
  currentIndex,
}: FindBestPatternDoubleAccentParadiddlesArgs): StickingPattern {
  const nextIsAccent =
    (currentIndex === BAR_LENGTH - 1 && accentMap8[0] === 1) ||
    accentMap8[currentIndex + 1] === 1

  let targetPatterns: StickingPattern[] = []

  if (nextIsAccent) {
    targetPatterns = patterns.filter(pattern =>
      pattern.split('').some(char => char === char.toLowerCase())
    )
  }

  return findBestPattern({
    result,
    patterns: targetPatterns.length > 0 ? targetPatterns : patterns,
  })
}