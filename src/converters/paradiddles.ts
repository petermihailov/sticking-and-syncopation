import { drumRudiments } from './replaces.map.ts'
import {
  INVALID_TRANSITIONS,
  PATTERN_SCORES,
  SPECIAL_PATTERNS,
} from './constants.ts'
import type { Accent, Sticking } from '../types.ts'

export type RudimentType =
  | 'paradiddle_single_accent'
  | 'paradiddle_double_accent'
  | 'invert_paradiddle_single_accent'
  | 'invert_paradiddle_double_accent'

export interface ParadiddleResult {
  bars: string[]
  isMirrored: boolean
  rudimentType: RudimentType
}

export function convertToParadiddles(
  accentMap8: Accent[],
  rudimentType: RudimentType
): ParadiddleResult {
  validateInput(accentMap8)

  let bar = generateRawBar(accentMap8, rudimentType)
  bar = ensureStartsWithRightHand(bar)

  const isMirrored = shouldCreateMirroredBar(bar)
  const bars = createFormattedBars(bar, isMirrored)

  return {
    bars,
    isMirrored,
    rudimentType,
  }
}

function generateRawBar(
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

function appendPatternToResult(result: Sticking[], pattern: string): void {
  for (const char of pattern) {
    result.push(char as Sticking)
  }
}

function selectBestPatternFromArray(
  result: Sticking[],
  patterns: string[],
  rudimentType: RudimentType,
  currentPosition: number,
  accentMap: Accent[]
): string {
  if (rudimentType === 'invert_paradiddle_double_accent') {
    return selectPatternForInvertDoubleAccent(
      result,
      patterns,
      currentPosition,
      accentMap
    )
  }

  return findBestPattern(result, patterns)
}

function findBestPattern(result: Sticking[], patterns: string[]): string {
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

function selectPatternForInvertDoubleAccent(
  result: Sticking[],
  patterns: string[],
  currentPosition: number,
  accentMap: Accent[]
): string {
  const currentAccent = accentMap[currentPosition]

  if (currentAccent === 1) {
    return selectAccentedPattern(result, patterns, currentPosition, accentMap)
  }

  if (currentAccent === 0) {
    return selectNonAccentedPattern(result, patterns, currentPosition, accentMap)
  }

  return findBestPattern(result, patterns)
}

function selectAccentedPattern(
  result: Sticking[],
  patterns: string[],
  currentPosition: number,
  accentMap: Accent[]
): string {
  const shouldUseDoubleAccent = shouldUseDoubleAccentAtPosition(
    currentPosition,
    accentMap
  )

  if (shouldUseDoubleAccent) {
    const doubleAccentPatterns = filterPatterns(patterns, ['RL', 'LR'])
    if (doubleAccentPatterns.length > 0) {
      return findBestPattern(result, doubleAccentPatterns)
    }
  }

  const singleAccentPatterns = filterPatterns(patterns, ['Rl', 'Lr'])
  if (singleAccentPatterns.length > 0) {
    return findBestPattern(result, singleAccentPatterns)
  }

  const fallbackDoubleAccentPatterns = filterPatterns(patterns, ['RL', 'LR'])
  if (fallbackDoubleAccentPatterns.length > 0) {
    return findBestPattern(result, fallbackDoubleAccentPatterns)
  }

  return findBestPattern(result, patterns)
}

function selectNonAccentedPattern(
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
  const patternsWithLowerEnd = patterns.filter(pattern =>
    !isCapitalLetter(pattern[pattern.length - 1])
  )

  const candidatePatterns = targetIsAccented
    ? patternsWithCapitalEnd
    : patternsWithLowerEnd
  const finalPatterns = candidatePatterns.length > 0 ? candidatePatterns : patterns

  return findBestPattern(result, finalPatterns)
}

function filterPatterns(patterns: string[], targetPatterns: string[]): string[] {
  return patterns.filter(pattern => targetPatterns.includes(pattern))
}

function isCapitalLetter(char: string): boolean {
  return char === char.toUpperCase()
}

function shouldUseDoubleAccentAtPosition(
  position: number,
  accentMap: Accent[]
): boolean {
  const pattern = accentMap.join('')

  if (pattern === '10011001') {
    return position === 3 || position === 7
  }

  return false
}

function evaluatePatternQuality(result: Sticking[], pattern: string): number {
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

function validateInput(accentMap8: Accent[]): void {
  if (accentMap8.length !== 8) {
    throw new Error('accentMap8 must have exactly 8 elements')
  }
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

function isAccented(char: Sticking): boolean {
  return char === char.toUpperCase()
}

function ensureStartsWithRightHand(bar: Sticking[]): Sticking[] {
  if (bar.length > 0 && bar[0].toLowerCase() === 'l') {
    return flipHands(bar)
  }
  return bar
}

function shouldCreateMirroredBar(bar: Sticking[]): boolean {
  if (bar.length === 0) return false

  const first = bar[0]
  const last = bar[bar.length - 1]

  const firstHand = first.toLowerCase()
  const lastHand = last.toLowerCase()
  const firstAccented = isAccented(first)
  const lastAccented = isAccented(last)

  return (
    firstHand === lastHand &&
    (firstAccented !== lastAccented || (firstAccented && lastAccented))
  )
}

function createFormattedBars(
  bar: Sticking[],
  includeMirrored: boolean
): string[] {
  const bars = [formatBar(bar)]

  if (includeMirrored) {
    const mirroredBar = flipHands(bar)
    bars.push(formatBar(mirroredBar))
  }

  return bars
}

function flipHands(bar: Sticking[]): Sticking[] {
  return bar.map(char => {
    const accented = isAccented(char)
    const flippedHand: Sticking = char.toLowerCase() === 'r' ? 'l' : 'r'
    return accented ? (flippedHand.toUpperCase() as Sticking) : flippedHand
  })
}

function formatBar(bar: Sticking[]): string {
  const quarters = []
  for (let i = 0; i < bar.length; i += 4) {
    quarters.push(bar.slice(i, i + 4).join(''))
  }
  return quarters.join(' ')
}
