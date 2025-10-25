import type { Sticking } from '../../types.ts'
import { flipHands } from './hand-utils.ts'
import { INVALID_TRANSITIONS } from './quality-evaluator.ts'

/**
 * Check if a mirrored (flipped) bar should be created
 * Determines whether playing pattern + flipped pattern creates better sticking flow
 */
export function shouldCreateMirroredBar(bar: Sticking[]): boolean {
  const calcDoubles = (str: string) => (str.match(/rr|ll/g) || []).length

  // Test two sequences:
  // 1. bar + bar (non-flipped)
  // 2. bar + flipHands(bar) (flipped)
  const testNonFlippedSequence = bar.join('') + bar.join('')
  const testFlippedSequence = bar.join('') + flipHands(bar).join('')

  // Check for invalid transitions (rrr, rR, RR, etc)
  const nonFlippedValid = !INVALID_TRANSITIONS.some(transition =>
    testNonFlippedSequence.includes(transition)
  )
  const flippedValid = !INVALID_TRANSITIONS.some(transition =>
    testFlippedSequence.includes(transition)
  )

  // Special case: pattern ends with 'rk' (right hand + kick)
  if (
    bar
      .map(s => s.toLowerCase())
      .join('')
      .endsWith('rk')
  ) {
    return true
  }

  // If only flipped version is valid
  if (!nonFlippedValid && flippedValid) {
    return true
  }

  // If only non-flipped version is valid
  if (nonFlippedValid && !flippedValid) {
    return false
  }

  // If both are valid, prefer the one with more doubles (rr/ll)
  if (nonFlippedValid && flippedValid) {
    const nonFlippedDoubles = calcDoubles(testNonFlippedSequence)
    const flippedDoubles = calcDoubles(testFlippedSequence)
    return flippedDoubles > nonFlippedDoubles
  }

  // If both are invalid, don't mirror
  return false
}
