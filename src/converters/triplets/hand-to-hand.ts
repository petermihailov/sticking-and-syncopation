import { accentReplaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'

export function convertHandToHand(accentMap8: Accent[]): Sticking[] {
  const pairs = []

  // Convert 8 individual accents to 4 pairs
  for (let i = 0; i < accentMap8.length; i += 2) {
    const pair = `${accentMap8[i]}${accentMap8[i + 1] || 0}`
    pairs.push(pair)
  }

  // Convert each pair to triplet using accentReplaces
  const triplets: string[] = []
  for (const pair of pairs) {
    const triplet = accentReplaces[pair as keyof typeof accentReplaces]
    triplets.push(triplet)
  }

  // Generate rlrlrlrlrlrl pattern and apply accents
  const handPattern = 'rlrlrlrlrlrl'
  const result: Sticking[] = []

  const accentPattern = triplets.join('')

  for (let i = 0; i < handPattern.length; i++) {
    const hand = handPattern[i] as 'r' | 'l'
    const isAccent = accentPattern[i] === '1'
    result.push(isAccent ? hand.toUpperCase() as Sticking : hand as Sticking)
  }

  return result
}