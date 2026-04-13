import type {
  Accent,
  FlamPattern,
  Sticking,
  StickingPattern,
} from '../../types'
import type { ConverterReplaces, PatternFilter } from './types'
import { findBestPattern } from './pattern-selector'

/**
 * Разбирает паттерн с флэм-маркерами (').
 * `'Rlr` → stickings: ['R','l','r'], flams: [true, false, false]
 */
export function parseFlams(pattern: string): {
  stickings: Sticking[]
  flams: boolean[]
} {
  const stickings: Sticking[] = []
  const flams: boolean[] = []
  let flamNext = false

  for (const ch of pattern) {
    if (ch === "'") {
      flamNext = true
      continue
    }
    stickings.push(ch as Sticking)
    flams.push(flamNext)
    flamNext = false
  }

  return { stickings, flams }
}

/** Проверяет, содержит ли какой-либо паттерн в replaces символ флэма */
export function replacesHaveFlams(replaces: ConverterReplaces): boolean {
  return Object.values(replaces).some(patterns =>
    patterns.some(p => p.includes("'"))
  )
}

type ProcessAccentsOptions = {
  /** Function to filter available patterns based on context */
  filterPatterns?: PatternFilter
}

/**
 * Process accent map by iterating through each accent (16th note based converters)
 */
export function processAccents(
  accentMap8: Accent[],
  replaces: ConverterReplaces,
  options?: ProcessAccentsOptions
): Sticking[] {
  const result: Sticking[] = []
  const accentCount = accentMap8.length

  for (let i = 0; i < accentCount; i++) {
    const accentLevel = String(accentMap8[i]) as '0' | '1'
    const availablePatterns = replaces[accentLevel] as StickingPattern[]
    const isAccent = accentMap8[i] === 1
    const nextIsAccent =
      (i === accentCount - 1 && accentMap8[0] === 1) || accentMap8[i + 1] === 1

    let targetPatterns = availablePatterns

    if (options?.filterPatterns) {
      targetPatterns = options.filterPatterns(availablePatterns, {
        result,
        index: i,
        accentMap8,
        isAccent,
        nextIsAccent,
      })
    }

    const chosenPattern = findBestPattern({
      patterns: targetPatterns.length > 0 ? targetPatterns : availablePatterns,
      result,
    })

    result.push(...(chosenPattern.split('') as Sticking[]))
  }

  return result
}

/**
 * Simple converter without filtering (for basic paradiddles)
 */
export function processAccentsSimple(
  accentMap8: Accent[],
  replaces: ConverterReplaces
): Sticking[] {
  const result: Sticking[] = []

  for (const accent of accentMap8) {
    const availablePatterns = replaces[
      String(accent) as '0' | '1'
    ] as StickingPattern[]
    const chosenPattern = findBestPattern({
      patterns: availablePatterns,
      result,
    })

    result.push(...(chosenPattern.split('') as Sticking[]))
  }

  return result
}

type ProcessPairsOptions = {
  /** Custom pattern selection logic based on result and available patterns */
  selectPattern?: (
    availablePatterns: (StickingPattern | FlamPattern)[],
    result: Sticking[]
  ) => StickingPattern | FlamPattern
}

export type ProcessPairsResult = {
  stickings: Sticking[]
  flams?: boolean[]
}

/**
 * Process accent map by pairs (triplet-based converters).
 * Автоматически определяет наличие флэмов в replaces и парсит их.
 */
export function processPairs(
  accentMap8: Accent[],
  replaces: ConverterReplaces,
  options?: ProcessPairsOptions
): ProcessPairsResult {
  const result: Sticking[] = []
  const hasFlams = replacesHaveFlams(replaces)
  const flamResult: boolean[] = []
  const pairCount = Math.floor(accentMap8.length / 2)

  for (let i = 0; i < pairCount; i++) {
    const pair = `${accentMap8[i * 2] || 0}${accentMap8[i * 2 + 1] || 0}`
    const availablePatterns = replaces[
      pair as keyof typeof replaces
    ] as StickingPattern[]

    const chosenPattern = options?.selectPattern
      ? options.selectPattern(availablePatterns, result)
      : findBestPattern({ patterns: availablePatterns, result })

    if (hasFlams) {
      const parsed = parseFlams(chosenPattern)
      result.push(...parsed.stickings)
      flamResult.push(...parsed.flams)
    } else {
      result.push(...(chosenPattern.split('') as Sticking[]))
    }
  }

  return {
    stickings: result,
    flams: hasFlams ? flamResult : undefined,
  }
}
