import { replaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'

export { replaces } from './replaces.ts'
export const converterName = '8th hand-to-hand triplets'
export const pattern = 'Rlr' // replaces['11'] = '101' -> Rlr pattern

/** Convert to 8th hand-to-hand triplets */
export function convert(accentMap8: Accent[]): Sticking[] {
  const pairs = []

  // Convert 8 individual accents to 4 pairs
  for (let i = 0; i < accentMap8.length; i += 2) {
    const pair = `${accentMap8[i]}${accentMap8[i + 1] || 0}`
    pairs.push(pair)
  }

  // Convert each pair to triplet using accentReplaces
  const triplets: string[] = []
  for (const pair of pairs) {
    const triplet = replaces[pair as keyof typeof replaces]
    triplets.push(triplet)
  }

  // Generate rlrlrlrlrlrl pattern and apply accents
  const handPattern = 'rlrlrlrlrlrl'
  const result: Sticking[] = []

  const accentPattern = triplets.join('')

  for (let i = 0; i < handPattern.length; i++) {
    const hand = handPattern[i] as 'r' | 'l'
    const isAccent = accentPattern[i] === '1'
    result.push(
      isAccent ? (hand.toUpperCase() as Sticking) : (hand as Sticking)
    )
  }

  return result
}
