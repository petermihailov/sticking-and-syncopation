import type { Accent, Sticking, StickingPattern } from '../../../types.ts'
import { BAR_LENGTH } from '../../constants.ts'
import { findBestPattern } from './findBestPattern.ts'

type FindBestPatternInvertKickParadiddlesArgs = {
  result: Sticking[]
  patterns: StickingPattern[]
  currentIndex: number
  accentMap8: Accent[]
}

export function findBestPatternInvertKickParadiddles({
  result,
  patterns,
  accentMap8,
  currentIndex,
}: FindBestPatternInvertKickParadiddlesArgs): StickingPattern {
  const nextIsAccent =
    (currentIndex === BAR_LENGTH - 1 && accentMap8[0] === 1) ||
    accentMap8[currentIndex + 1] === 1

  const lastPattern = result[result.length - 1]
  const isAccent = accentMap8[currentIndex] === 1

  let targetPatterns: StickingPattern[] = []

  if (nextIsAccent) {
    targetPatterns = patterns.filter(pattern =>
      pattern.split('').some(char => char === 'k')
    )
  }

  if (isAccent) {
    if (lastPattern?.startsWith('r')) {
      targetPatterns = patterns.filter(
        pattern => pattern.split('')[0].toLowerCase() === 'l'
      )
    }
    if (lastPattern?.startsWith('l')) {
      targetPatterns = patterns.filter(
        pattern => pattern.split('')[0].toLowerCase() === 'r'
      )
    }
  }

  return findBestPattern({
    result,
    patterns: targetPatterns.length > 0 ? targetPatterns : patterns,
  })
}
