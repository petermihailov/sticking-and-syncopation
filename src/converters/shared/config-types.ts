import type { Accent, FlamPattern, Sticking, StickingPattern } from '../../types'

export type ConverterReplaces = Record<string, (StickingPattern | FlamPattern)[]>

export type FilterContext = {
  result: Sticking[]
  index: number
  accentMap8: Accent[]
  isAccent: boolean
  nextIsAccent: boolean
}

export type PatternFilter = (
  patterns: StickingPattern[],
  context: FilterContext
) => StickingPattern[]

export type CaseFilterRule = {
  when: 'nextIsAccent' | 'isAccent' | 'both'
  prefer: 'uppercase' | 'lowercase' | 'someLowercase' | 'someUppercase'
}

export type CharFilterRule = {
  when: 'nextIsAccent' | 'isAccent' | 'always'
  preferChar: string
}

export type AlternateHandsRule = {
  when: 'isAccent'
  alternateHands: true
}

export type FilterConfig =
  | { type: 'none' }
  | { type: 'caseAware'; rules: CaseFilterRule[] }
  | { type: 'charPreference'; rules: CharFilterRule[] }
  | { type: 'alternateHands'; rule: AlternateHandsRule }
  | { type: 'custom'; filterFn: PatternFilter }

export type SelectPatternConfig =
  | { type: 'best' }
  | { type: 'byLastPattern'; mapping: Record<string, number> }
  | {
      type: 'custom'
      selectFn: (
        patterns: (StickingPattern | FlamPattern)[],
        result: Sticking[]
      ) => StickingPattern | FlamPattern
    }

export type ConverterConfig = {
  converterName: string
  pattern: string
  replaces: ConverterReplaces
  mode: 'accents' | 'pairs'
  filterConfig?: FilterConfig
  selectConfig?: SelectPatternConfig
}

export type ConvertResultBars = {
  bar1: Sticking[]
  bar2?: Sticking[]
  flams1?: boolean[]
  flams2?: boolean[]
}

export type ConverterExports = {
  converterName: string
  pattern: string
  replaces: ConverterReplaces
  convert: (accentMap8: Accent[]) => ConvertResultBars
}
