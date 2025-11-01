import { replaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'

export { replaces } from './replaces.ts'
export const converterName = '8th hand-to-hand triplets'
export const pattern = 'Rlr'

/** Convert to 8th hand-to-hand triplets */
export function convert(accentMap8: Accent[]): Sticking[] {
  const handPattern = 'rlrlrlrlrlrl'

  const accentPattern = Array.from({ length: 4 }, (_, i) => {
    const pair = `${accentMap8[i * 2]}${accentMap8[i * 2 + 1] || 0}`
    return replaces[pair as keyof typeof replaces]
  }).join('')

  return Array.from(handPattern, (hand, i) => {
    const isAccent = accentPattern[i] === '1'
    return (isAccent ? hand.toUpperCase() : hand) as Sticking
  })
}
