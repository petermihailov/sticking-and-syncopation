import type { Accent } from '../../types.ts'
import { validateInput } from './core/validator.ts'
import { convert, type RudimentType } from './core/generator.ts'
import {
  createFormattedBars,
  shouldCreateMirroredBar,
} from './core/formatter.ts'

export interface ParadiddleResult {
  bars: string[]
  isMirrored: boolean
  rudimentType: RudimentType
}

export type { RudimentType }

export function convertToParadiddles(
  accentMap8: Accent[],
  rudimentType: RudimentType
): ParadiddleResult {
  validateInput(accentMap8)

  const bar = convert(accentMap8, rudimentType)
  const isMirrored = shouldCreateMirroredBar({ bar, rudimentType, accentMap8 })
  const bars = createFormattedBars(bar, isMirrored)

  return {
    bars,
    isMirrored,
    rudimentType,
  }
}
