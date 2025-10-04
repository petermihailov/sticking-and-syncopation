import { paradiddleReplaces } from '../replaces.ts'
import { BAR_LENGTH } from '../../constants.ts'
import type { Accent, Sticking } from '../../../types.ts'
import { findBestPattern } from '../strategies/findBestPattern.ts'
import { findBestPatternInvertParadiddles } from '../strategies/findBestPatternInvertParadiddles.ts'
import { findBestPatternDoubleAccentParadiddles } from '../strategies/findBestPatternDoubleAccentParadiddles.ts'
import { findBestPatternInvertKickParadiddles } from '../strategies/findBestPatternInvertKickParadiddles.ts'

export type RudimentType =
  | 'paradiddle_single_accent'
  | 'paradiddle_double_accent'
  | 'invert_paradiddle_single_accent'
  | 'invert_paradiddle_double_accent'
  | 'invert_paradiddle_kick'

export function convert(
  accentMap8: Accent[],
  rudimentType: RudimentType
): Sticking[] {
  let result: Sticking[] = []
  const rudiment = paradiddleReplaces[rudimentType]

  for (let i = 0; i < BAR_LENGTH; i++) {
    const accentLevel = accentMap8[i] === 1 ? '1' : '0'
    const availablePatterns = rudiment[accentLevel]
    let chosenPattern = availablePatterns[0]

    switch (rudimentType) {
      case 'invert_paradiddle_single_accent':
      case 'invert_paradiddle_double_accent': {
        chosenPattern = findBestPatternInvertParadiddles({
          patterns: availablePatterns,
          result,
          currentIndex: i,
          accentMap8,
        })
        break
      }

      case 'invert_paradiddle_kick': {
        chosenPattern = findBestPatternInvertKickParadiddles({
          patterns: availablePatterns,
          result,
          currentIndex: i,
          accentMap8,
        })
        break
      }

      case 'paradiddle_double_accent': {
        chosenPattern = findBestPatternDoubleAccentParadiddles({
          patterns: availablePatterns,
          result,
          currentIndex: i,
          accentMap8,
        })
        break
      }

      default: {
        chosenPattern = findBestPattern({
          patterns: availablePatterns,
          result,
        })
      }
    }

    result = [...result, chosenPattern as Sticking]
  }

  return result.join('').split('') as Sticking[]
}
