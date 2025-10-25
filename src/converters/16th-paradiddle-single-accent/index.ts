import { replaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'
import { findBestPattern } from '../shared/pattern-selector.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th paradiddle single accent'
export const pattern = replaces['1'][0] + replaces['0'][0]

/** Convert to 16th paradiddle single accent */
export function convert(accentMap8: Accent[]): Sticking[] {
  let result: Sticking[] = []

  for (let i = 0; i < accentMap8.length; i++) {
    const accentLevel = accentMap8[i] === 1 ? '1' : '0'
    const availablePatterns = replaces[accentLevel]

    const chosenPattern = findBestPattern({
      patterns: availablePatterns,
      result,
    })

    result = [...result, chosenPattern as Sticking]
  }

  return result.join('').split('') as Sticking[]
}
