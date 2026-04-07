import type { Sticking, StickingPattern } from '../../types'
import { evaluatePatternQuality } from './quality-evaluator'

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
