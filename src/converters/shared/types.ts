import type { Accent, FlamPattern, Sticking, StickingPattern } from '../../types'

/** Mapping of accent patterns to sticking patterns */
export type ConverterReplaces = Record<string, (StickingPattern | FlamPattern)[]>

/** Metadata for a converter */
export type ConverterMetadata = {
  converterName: string
  pattern: string
  replaces: ConverterReplaces
}

/** Main converter function signature */
export type ConvertFunction = (accentMap8: Accent[]) => Sticking[]

/** Context for pattern filtering */
export type FilterContext = {
  result: Sticking[]
  index: number
  accentMap8: Accent[]
  isAccent: boolean
  nextIsAccent: boolean
}

/** Pattern filter function */
export type PatternFilter = (
  patterns: StickingPattern[],
  context: FilterContext
) => StickingPattern[]
