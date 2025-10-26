import { replaces } from './replaces.ts'
import type { Accent, Sticking, StickingPattern } from '../../types.ts'
import { findBestPattern } from '../shared/pattern-selector.ts'

export { replaces } from './replaces.ts'
export const converterName = '8th inverted doubles in triplets'
export const pattern = replaces['10'][0]

/** Convert to 8th inverted doubles in triplets */
export function convert(accentMap8: Accent[]): Sticking[] {
  const pairs = []

  // Convert 8 individual accents to 4 pairs
  for (let i = 0; i < accentMap8.length; i += 2) {
    const pair = `${accentMap8[i]}${accentMap8[i + 1] || 0}`
    pairs.push(pair)
  }

  const result: Sticking[] = []

  // For each pair, choose best pattern to avoid invalid transitions
  for (const pair of pairs) {
    const availablePatterns = replaces[
      pair as keyof typeof replaces
    ] as StickingPattern[]

    const chosenPattern = findBestPattern({
      patterns: availablePatterns,
      result,
    })

    // Add each character from the pattern
    for (const char of chosenPattern) {
      result.push(char as Sticking)
    }
  }

  return result
}
