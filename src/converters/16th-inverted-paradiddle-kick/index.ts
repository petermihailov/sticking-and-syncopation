import { replaces } from './replaces.ts'
import { createConverter } from '../shared/config-converter.ts'
import type { StickingPattern } from '../../types.ts'
import type { FilterContext } from '../shared/config-types.ts'
import { getOppositeHand, preferChar, preferStartingWith } from '../shared/filter-builders.ts'

const config = createConverter({
  converterName: '16th inverted paradiddle kick',
  pattern: replaces['1'][0] + replaces['0'][3],
  replaces,
  mode: 'accents',
  filterConfig: {
    type: 'custom',
    filterFn: (patterns: StickingPattern[], context: FilterContext) => {
      const { result, nextIsAccent, isAccent } = context

      // Prefer kick patterns before accents
      if (nextIsAccent && !isAccent) {
        const filtered = preferChar('k')(patterns)
        if (filtered.length > 0) return filtered
      }

      // Alternate hands on accents
      if (isAccent && result.length >= 2) {
        // Find last actual hand stroke (ignore 'k' which is kick drum)
        let lastHand = result[result.length - 1]
        if (lastHand === 'k') {
          for (let i = result.length - 2; i >= 0; i--) {
            if (result[i] !== 'k') {
              lastHand = result[i]
              break
            }
          }
        }
        const oppositeHand = getOppositeHand(lastHand)
        const filtered = preferStartingWith(oppositeHand)(patterns)
        if (filtered.length > 0) return filtered
      }

      return patterns
    },
  },
})

export const { converterName, pattern, convert } = config
export { replaces }
export { generateNotation } from './generateNotation.ts'
