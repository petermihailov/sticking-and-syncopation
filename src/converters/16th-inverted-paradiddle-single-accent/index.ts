import { replaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'
import { processAccents } from '../shared/converter-utils.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th inverted paradiddle single accent'
export const pattern = replaces['1'][0] + replaces['0'][1]

/** Convert to 16th inverted paradiddle single accent */
export function convert(accentMap8: Accent[]): Sticking[] {
  return processAccents(accentMap8, replaces, {
    filterPatterns: (availablePatterns, { nextIsAccent }) => {
      if (nextIsAccent) {
        return availablePatterns.filter(p => p.split('').some(c => c === c.toUpperCase()))
      }
      return availablePatterns.filter(p => p.split('').every(c => c === c.toLowerCase()))
    },
  })
}
