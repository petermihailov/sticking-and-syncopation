import type { Accent } from '../../types.ts'
import { validateInput } from './core/validator.ts'
import { generateRawBar, type RudimentType } from './core/generator.ts'
import { createFormattedBars, shouldCreateMirroredBar } from './core/formatter.ts'
import { ensureStartsWithRightHand } from './utils/hand-utils.ts'

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

  let bar = generateRawBar(accentMap8, rudimentType)
  bar = ensureStartsWithRightHand(bar)

  const isMirrored = shouldCreateMirroredBar(bar)
  const bars = createFormattedBars(bar, isMirrored)

  return {
    bars,
    isMirrored,
    rudimentType,
  }
}