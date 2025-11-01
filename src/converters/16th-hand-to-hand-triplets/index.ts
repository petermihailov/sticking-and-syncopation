import { replaces } from './replaces.ts'
import type { Accent, Sticking, StickingPattern } from '../../types.ts'
import { processPairs } from '../shared/converter-utils.ts'
import { findBestPattern } from '../shared/pattern-selector.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th hand-to-hand triplets'
export const pattern = replaces['10'][0]

/** Convert to 16th hand-to-hand triplets */
export function convert(accentMap8: Accent[]): Sticking[] {
  return processPairs(accentMap8, replaces, {
    selectPattern: (availablePatterns: StickingPattern[], result: Sticking[]) => {
      const lastTwo = result.slice(-2).join('')
      if (lastTwo === 'R ') {
        return availablePatterns[1]
      }
      if (lastTwo === 'L ') {
        return availablePatterns[0]
      }
      return findBestPattern({ patterns: availablePatterns, result })
    },
  })
}
