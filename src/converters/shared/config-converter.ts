import type { Accent, Sticking, StickingPattern } from '../../types.ts'
import type {
  ConverterConfig,
  ConverterExports,
  FilterContext,
  PatternFilter,
} from './config-types.ts'
import {
  processAccents,
  processAccentsSimple,
  processPairs,
} from './converter-utils.ts'
import { findBestPattern } from './pattern-selector.ts'
import {
  requireAllLowercase,
  requireSomeUppercase,
  requireSomeLowercase,
  requireAllUppercase,
  preferChar,
  preferStartingWith,
  getOppositeHand,
} from './filter-builders.ts'

function createFilterFromConfig(
  config: ConverterConfig['filterConfig']
): PatternFilter | undefined {
  if (!config || config.type === 'none') {
    return undefined
  }

  if (config.type === 'custom') {
    return config.filterFn
  }

  if (config.type === 'caseAware') {
    return (patterns: StickingPattern[], context: FilterContext) => {
      for (const rule of config.rules) {
        let applies = false

        if (rule.when === 'nextIsAccent' && context.nextIsAccent) applies = true
        if (rule.when === 'isAccent' && context.isAccent) applies = true
        if (rule.when === 'both' && context.nextIsAccent && context.isAccent)
          applies = true

        if (applies) {
          if (rule.prefer === 'uppercase') return requireAllUppercase(patterns)
          if (rule.prefer === 'lowercase') return requireAllLowercase(patterns)
          if (rule.prefer === 'someUppercase')
            return requireSomeUppercase(patterns)
          if (rule.prefer === 'someLowercase')
            return requireSomeLowercase(patterns)
        }
      }

      const defaultFiltered = requireAllLowercase(patterns)
      return defaultFiltered.length > 0 ? defaultFiltered : patterns
    }
  }

  if (config.type === 'charPreference') {
    return (patterns: StickingPattern[], context: FilterContext) => {
      for (const rule of config.rules) {
        let applies = false

        if (rule.when === 'nextIsAccent' && context.nextIsAccent) applies = true
        if (rule.when === 'isAccent' && context.isAccent) applies = true
        if (rule.when === 'always') applies = true

        if (applies) {
          const filtered = preferChar(rule.preferChar)(patterns)
          if (filtered.length > 0) return filtered
        }
      }
      return patterns
    }
  }

  if (config.type === 'alternateHands') {
    return (patterns: StickingPattern[], context: FilterContext) => {
      if (context.isAccent && context.result.length >= 2) {
        const lastChar = context.result[context.result.length - 1]
        const oppositeHand = getOppositeHand(lastChar)
        const filtered = preferStartingWith(oppositeHand)(patterns)
        if (filtered.length > 0) return filtered
      }
      return patterns
    }
  }

  return undefined
}

function createSelectFromConfig(
  config: ConverterConfig['selectConfig']
):
  | ((patterns: StickingPattern[], result: Sticking[]) => StickingPattern)
  | undefined {
  if (!config || config.type === 'best') {
    return undefined // Use default findBestPattern
  }

  if (config.type === 'custom') {
    return config.selectFn
  }

  if (config.type === 'byLastPattern') {
    return (patterns: StickingPattern[], result: Sticking[]) => {
      if (!patterns || patterns.length === 0) {
        throw new Error('No patterns available for selection')
      }

      const lastTwo = result.slice(-2).join('')

      if (config.mapping[lastTwo] !== undefined) {
        const index = config.mapping[lastTwo]
        if (patterns[index]) {
          return patterns[index]
        }
      }

      return findBestPattern({ patterns, result })
    }
  }

  return undefined
}

export function createConverter(config: ConverterConfig): ConverterExports {
  const filterFn = createFilterFromConfig(config.filterConfig)
  const selectFn = createSelectFromConfig(config.selectConfig)

  // Helper to generate a single bar
  const generateBar = (accentMap: Accent[]): Sticking[] => {
    if (config.mode === 'accents') {
      if (!filterFn) {
        return processAccentsSimple(accentMap, config.replaces)
      }

      return processAccents(accentMap, config.replaces, {
        filterPatterns: filterFn,
      })
    }

    if (config.mode === 'pairs') {
      if (!selectFn) {
        return processPairs(accentMap, config.replaces)
      }

      return processPairs(accentMap, config.replaces, {
        selectPattern: selectFn,
      })
    }

    throw new Error(`Unknown mode: ${config.mode}`)
  }

  const convert = (accentMap8: Accent[]) => {
    // Generate 2 bars at once to ensure proper hand transitions
    const doubledAccents: Accent[] = [...accentMap8, ...accentMap8]
    const doubleBars = generateBar(doubledAccents)

    // Calculate bar length based on single bar generation
    const singleBar = generateBar(accentMap8)
    const barLength = singleBar.length

    // Split into two bars
    const bar1 = doubleBars.slice(0, barLength)
    const bar2 = doubleBars.slice(barLength, barLength * 2)

    // Compare bars - if identical, only return bar1
    const barsAreIdentical = bar1.length === bar2.length &&
      bar1.every((s, i) => s === bar2[i])

    return {
      bar1,
      bar2: barsAreIdentical ? undefined : bar2,
    }
  }

  return {
    converterName: config.converterName,
    pattern: config.pattern,
    replaces: config.replaces,
    convert,
  }
}
