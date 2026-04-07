import { replaces } from './replaces'
import { createConverter } from '../shared/config-converter'
import type { StickingPattern } from '../../types'
import type { FilterContext } from '../shared/config-types'
import {
  getOppositeHand,
  preferChar,
  preferStartingWith,
} from '../shared/filter-builders'

const config = createConverter({
  converterName: '16th inverted paradiddle kick right accent',
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
        const lastChar = result[result.length - 1]
        const oppositeHand = getOppositeHand(lastChar)
        const filtered = preferStartingWith(oppositeHand)(patterns)
        if (filtered.length > 0) return filtered
      }

      return patterns
    },
  },
})

export const { converterName, pattern, convert } = config
export { replaces }
