import { drumRudiments } from '../../replaces.ts'
import { BAR_LENGTH } from '../../constants.ts'
import type { Accent, Sticking } from '../../../types.ts'
import {
  findBestPattern,
  findBestPatternInvertParadiddles,
} from '../strategies/pattern-selector.ts'

export type RudimentType =
  | 'paradiddle_single_accent'
  | 'paradiddle_double_accent'
  | 'invert_paradiddle_single_accent'
  | 'invert_paradiddle_double_accent'

export function convert(
  accentMap8: Accent[],
  rudimentType: RudimentType
): Sticking[] {
  let result: Sticking[] = []
  const rudiment = drumRudiments[rudimentType]

  for (let i = 0; i < BAR_LENGTH; i++) {
    const accentLevel = accentMap8[i] === 1 ? '1' : '0'
    const availablePatterns = rudiment[accentLevel]
    let chosenPattern = availablePatterns[0]

    if (
      rudimentType === 'invert_paradiddle_single_accent' ||
      rudimentType === 'invert_paradiddle_double_accent'
    ) {
      chosenPattern = findBestPatternInvertParadiddles({
        patterns: availablePatterns,
        result,
        currentIndex: i,
        accentMap8,
      })
    } else {
      chosenPattern = findBestPattern({
        patterns: availablePatterns,
        result,
      })
    }

    result = [...result, chosenPattern as Sticking]
  }

  return result.join('').split('') as Sticking[]
}
