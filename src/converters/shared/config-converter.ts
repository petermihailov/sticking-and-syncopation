import type {
  Accent,
  FlamPattern,
  Sticking,
  StickingPattern,
} from '../../types'
import type {
  ConverterConfig,
  ConvertResultBars,
  ConverterExports,
  FilterContext,
  PatternFilter,
} from './config-types'
import {
  processAccents,
  processAccentsSimple,
  processPairs,
} from './converter-utils'
import { findBestPattern } from './pattern-selector'
import {
  requireAllLowercase,
  requireSomeUppercase,
  requireSomeLowercase,
  requireAllUppercase,
  preferChar,
  preferStartingWith,
  getOppositeHand,
} from './filter-builders'

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

  const _exhaustive: never = config
  return _exhaustive
}

function createSelectFromConfig(
  config: ConverterConfig['selectConfig']
):
  | ((
      patterns: (StickingPattern | FlamPattern)[],
      result: Sticking[]
    ) => StickingPattern | FlamPattern)
  | undefined {
  if (!config || config.type === 'best') {
    return undefined // Use default findBestPattern
  }

  if (config.type === 'custom') {
    return config.selectFn
  }

  if (config.type === 'byLastPattern') {
    return (
      patterns: (StickingPattern | FlamPattern)[],
      result: Sticking[]
    ) => {
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

  const _exhaustive: never = config
  return _exhaustive
}

export function createConverter(config: ConverterConfig): ConverterExports {
  const filterFn = createFilterFromConfig(config.filterConfig)
  const selectFn = createSelectFromConfig(config.selectConfig)

  // Генерация стикингов (и опционально флэмов) для одного прохода.
  const generateBar = (
    accentMap: Accent[]
  ): { stickings: Sticking[]; flams?: boolean[] } => {
    if (config.mode === 'accents') {
      const stickings = filterFn
        ? processAccents(accentMap, config.replaces, {
            filterPatterns: filterFn,
          })
        : processAccentsSimple(accentMap, config.replaces)
      return { stickings }
    }

    if (config.mode === 'pairs') {
      return processPairs(accentMap, config.replaces, {
        selectPattern: selectFn,
      })
    }

    throw new Error(`Unknown mode: ${config.mode}`)
  }

  const convert = (accentMap8: Accent[]): ConvertResultBars => {
    // Генерируем сразу два такта, чтобы корректно учесть переходы рук между ними.
    const doubledAccents: Accent[] = [...accentMap8, ...accentMap8]
    const doubled = generateBar(doubledAccents)

    const barLength = doubled.stickings.length / 2
    const bar1 = doubled.stickings.slice(0, barLength)
    const bar2 = doubled.stickings.slice(barLength)

    const barsAreIdentical = bar1.every((s, i) => s === bar2[i])

    const result: ConvertResultBars = {
      bar1,
      bar2: barsAreIdentical ? undefined : bar2,
    }

    if (doubled.flams) {
      result.flams1 = doubled.flams.slice(0, barLength)
      if (!barsAreIdentical) {
        result.flams2 = doubled.flams.slice(barLength)
      }
    }

    return result
  }

  return {
    converterName: config.converterName,
    pattern: config.pattern,
    replaces: config.replaces,
    convert,
  }
}
