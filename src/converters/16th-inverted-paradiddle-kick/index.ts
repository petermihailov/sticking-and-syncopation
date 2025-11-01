import { replaces } from './replaces.ts'
import type { Accent, Sticking, StickingPattern } from '../../types.ts'
import { processAccents } from '../shared/converter-utils.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th inverted paradiddle kick'
export const pattern = replaces['1'][0] + replaces['0'][3]

/** Convert to 16th invert paradiddle kick */
export function convert(accentMap8: Accent[]): Sticking[] {
  return processAccents(accentMap8, replaces, {
    filterPatterns: (availablePatterns, { nextIsAccent, isAccent, result }) => {
      let targetPatterns: StickingPattern[] = []

      // Prefer kick patterns before accents
      if (nextIsAccent && !isAccent) {
        targetPatterns = availablePatterns.filter(p => p.includes('k'))
      }

      // Alternate hands on accents
      if (isAccent && result.length >= 2) {
        const lastCharLower = result[result.length - 1]?.toLowerCase()
        if (lastCharLower === 'r' || lastCharLower === 'k') {
          targetPatterns = availablePatterns.filter(p => p[0].toLowerCase() === 'l')
        } else if (lastCharLower === 'l') {
          targetPatterns = availablePatterns.filter(p => p[0].toLowerCase() === 'r')
        }
      }

      return targetPatterns.length > 0 ? targetPatterns : availablePatterns
    },
  })
}
