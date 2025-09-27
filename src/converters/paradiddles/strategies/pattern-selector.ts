import type { Accent, Sticking } from '../../../types.ts'
import { evaluatePatternQuality } from './quality-evaluator.ts'
import { isCapitalLetter } from '../utils/pattern-utils.ts'

export function findBestPattern(
  result: Sticking[],
  patterns: string[]
): string {
  let bestPattern = patterns[0]
  let bestScore = evaluatePatternQuality(result, bestPattern)

  for (let i = 1; i < patterns.length; i++) {
    const score = evaluatePatternQuality(result, patterns[i])
    if (score > bestScore) {
      bestScore = score
      bestPattern = patterns[i]
    }
  }

  return bestPattern
}

export function selectNonAccentedPattern(
  result: Sticking[],
  patterns: string[],
  currentPosition: number,
  accentMap: Accent[]
): string {
  const isLastPosition = currentPosition === accentMap.length - 1
  const targetPosition = isLastPosition ? 0 : currentPosition + 1
  const targetIsAccented = accentMap[targetPosition] === 1

  const patternsWithCapitalEnd = patterns.filter(pattern =>
    isCapitalLetter(pattern[pattern.length - 1])
  )
  const patternsWithLowerEnd = patterns.filter(
    pattern => !isCapitalLetter(pattern[pattern.length - 1])
  )

  const candidatePatterns = targetIsAccented
    ? patternsWithCapitalEnd
    : patternsWithLowerEnd
  const finalPatterns =
    candidatePatterns.length > 0 ? candidatePatterns : patterns

  return findBestPattern(result, finalPatterns)
}
