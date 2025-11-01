import { replaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'
import { processAccents } from '../shared/converter-utils.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th paradiddle double accent'
export const pattern = replaces['1'][0] + replaces['0'][0]

/** Convert to 16th paradiddle double accent */
export function convert(accentMap8: Accent[]): Sticking[] {
  return processAccents(accentMap8, replaces, {
    filterPatterns: (availablePatterns, { nextIsAccent, isAccent }) => {
      // If next is accent and current is accent, prefer patterns with lowercase
      if (nextIsAccent && isAccent) {
        return availablePatterns.filter(p => p.split('').some(c => c === c.toLowerCase()))
      }
      return availablePatterns
    },
  })
}
