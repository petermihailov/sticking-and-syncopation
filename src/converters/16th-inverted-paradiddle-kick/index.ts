import { replaces } from './replaces.ts'
import type { Accent, Sticking, StickingPattern } from '../../types.ts'
import { findBestPattern } from '../shared/pattern-selector.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th inverted paradiddle kick'
export const pattern = replaces['1'][0] + replaces['0'][3]

const BAR_LENGTH = 8

/** Convert to 16th invert paradiddle kick */
export function convert(accentMap8: Accent[]): Sticking[] {
  let result: Sticking[] = []

  for (let i = 0; i < BAR_LENGTH; i++) {
    const accentLevel = accentMap8[i] === 1 ? '1' : '0'
    const availablePatterns = replaces[accentLevel]
    const isAccent = accentMap8[i] === 1

    const nextIsAccent =
      (i === BAR_LENGTH - 1 && accentMap8[0] === 1) || accentMap8[i + 1] === 1

    let targetPatterns: StickingPattern[] = []

    if (nextIsAccent && !isAccent) {
      targetPatterns = availablePatterns.filter(pattern =>
        pattern.split('').some(char => char === 'k')
      )
    }

    if (isAccent && result.length >= 2) {
      const lastChar = result[result.length - 1]
      const lastCharLower = lastChar?.toLowerCase()
      if (lastCharLower === 'r' || lastCharLower === 'k') {
        targetPatterns = availablePatterns.filter(
          pattern => pattern.split('')[0].toLowerCase() === 'l'
        )
      } else if (lastCharLower === 'l') {
        targetPatterns = availablePatterns.filter(
          pattern => pattern.split('')[0].toLowerCase() === 'r'
        )
      }
    }

    const chosenPattern = findBestPattern({
      patterns: targetPatterns.length > 0 ? targetPatterns : availablePatterns,
      result,
    })

    result = [...result, chosenPattern as Sticking]
  }

  return result.join('').split('') as Sticking[]
}
