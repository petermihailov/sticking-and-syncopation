import { PATTERN_SCORES, INVALID_TRANSITIONS } from '../../constants.ts'
import type { Sticking } from '../../../types.ts'

export function evaluatePatternQuality(result: Sticking[], pattern: string): number {
  const testSequence = createTestSequence(result, pattern)

  if (hasInvalidTransitions(testSequence)) {
    return PATTERN_SCORES.INVALID
  }

  if (hasThreeConsecutiveIdenticalHands(testSequence)) {
    return PATTERN_SCORES.INVALID
  }

  if (createsDoubleWithPrevious(result, pattern)) {
    return PATTERN_SCORES.CREATES_DOUBLE
  }

  return PATTERN_SCORES.VALID
}

function createTestSequence(result: Sticking[], pattern: string): Sticking[] {
  const testSequence = [...result]
  for (const char of pattern) {
    testSequence.push(char as Sticking)
  }
  return testSequence
}

function createsDoubleWithPrevious(
  result: Sticking[],
  pattern: string
): boolean {
  if (result.length === 0 || pattern.length === 0) {
    return false
  }

  const lastChar = result[result.length - 1].toLowerCase()
  const firstNewChar = pattern[0].toLowerCase()

  return lastChar === firstNewChar
}

function hasInvalidTransitions(sequence: Sticking[]): boolean {
  for (let i = 1; i < sequence.length; i++) {
    if (isInvalidTransition(sequence[i - 1], sequence[i])) {
      return true
    }
  }
  return false
}

function isInvalidTransition(prev: Sticking, curr: Sticking): boolean {
  const transition = `${prev}${curr}`
  return INVALID_TRANSITIONS.includes(transition as 'Rr')
}

function hasThreeConsecutiveIdenticalHands(sequence: Sticking[]): boolean {
  const handSequence = sequence.map(char => char.toLowerCase()).join('')

  for (let i = 0; i <= handSequence.length - 3; i++) {
    const substr = handSequence.slice(i, i + 3)
    if (substr[0] === substr[1] && substr[1] === substr[2]) {
      return true
    }
  }

  return false
}