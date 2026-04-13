import type { FlamPattern, Sticking, StickingPattern } from '../../types'
import { evaluatePatternQuality } from './quality-evaluator'

type FindBestPatternArgs = {
  result: Sticking[]
  patterns: (StickingPattern | FlamPattern)[]
}

export function findBestPattern({
  result,
  patterns,
}: FindBestPatternArgs): StickingPattern | FlamPattern {
  let bestScore = 0
  let bestPattern: StickingPattern | FlamPattern = patterns[0]

  for (let i = 0; i < patterns.length; i++) {
    const score = evaluatePatternQuality(result, patterns[i])
    if (score > bestScore) {
      bestScore = score
      bestPattern = patterns[i]
    }
  }

  return bestPattern
}
