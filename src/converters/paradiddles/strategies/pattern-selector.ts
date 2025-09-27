import type { Accent, Sticking, StickingPattern } from '../../../types.ts'
import { evaluatePatternQuality } from './quality-evaluator.ts'
import { BAR_LENGTH } from '../../constants.ts'

type FindBestPatternArgs = {
  result: Sticking[]
  patterns: StickingPattern[]
}

export function findBestPattern({
  result,
  patterns,
}: FindBestPatternArgs): StickingPattern {
  let bestScore = 0
  let bestPattern = patterns[0]

  for (let i = 0; i < patterns.length; i++) {
    const score = evaluatePatternQuality(result, patterns[i])
    if (score > bestScore) {
      bestScore = score
      bestPattern = patterns[i]
    }
  }

  return bestPattern
}

type FindBestPatternInvertParadiddlesArgs = {
  result: Sticking[]
  patterns: StickingPattern[]
  currentIndex: number
  accentMap8: Accent[]
}

export function findBestPatternInvertParadiddles({
  result,
  patterns,
  accentMap8,
  currentIndex,
}: FindBestPatternInvertParadiddlesArgs): StickingPattern {
  const nextIsAccent =
    (currentIndex === BAR_LENGTH - 1 && accentMap8[0] === 1) ||
    accentMap8[currentIndex + 1] === 1

  let targetPatterns = []

  if (nextIsAccent) {
    targetPatterns = patterns.filter(pattern =>
      pattern.split('').some(char => char === char.toUpperCase())
    )
  } else {
    targetPatterns = patterns.filter(pattern =>
      pattern.split('').every(char => char === char.toLowerCase())
    )
  }

  return findBestPattern({
    result,
    patterns: targetPatterns.length > 0 ? targetPatterns : patterns,
  })
}
