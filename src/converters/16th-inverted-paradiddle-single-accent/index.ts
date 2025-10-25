import { replaces } from './replaces.ts'
import type { Accent, Sticking, StickingPattern } from '../../types.ts'
import { findBestPattern } from '../shared/pattern-selector.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th inverted paradiddle single accent'
export const pattern = replaces['1'][0] + replaces['0'][1]

const BAR_LENGTH = 8

/** Convert to 16th inverted paradiddle single accent */
export function convert(accentMap8: Accent[]): Sticking[] {
  let result: Sticking[] = []

  for (let i = 0; i < BAR_LENGTH; i++) {
    const accentLevel = accentMap8[i] === 1 ? '1' : '0'
    const availablePatterns = replaces[accentLevel]

    const nextIsAccent =
      (i === BAR_LENGTH - 1 && accentMap8[0] === 1) || accentMap8[i + 1] === 1

    let targetPatterns: StickingPattern[] = []

    if (nextIsAccent) {
      targetPatterns = availablePatterns.filter(pattern =>
        pattern.split('').some(char => char === char.toUpperCase())
      )
    } else {
      targetPatterns = availablePatterns.filter(pattern =>
        pattern.split('').every(char => char === char.toLowerCase())
      )
    }

    const chosenPattern = findBestPattern({
      patterns: targetPatterns.length > 0 ? targetPatterns : availablePatterns,
      result,
    })

    result = [...result, chosenPattern as Sticking]
  }

  return result.join('').split('') as Sticking[]
}
