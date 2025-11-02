import type { Accent, Sticking, StickingPattern } from '../../types.ts'

export type ConverterReplaces = Record<string, StickingPattern[]>

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
      selectFn: (patterns: StickingPattern[], result: Sticking[]) => StickingPattern
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
}

export type ConverterExports = {
  converterName: string
  pattern: string
  replaces: ConverterReplaces
  convert: (accentMap8: Accent[]) => ConvertResultBars
}
