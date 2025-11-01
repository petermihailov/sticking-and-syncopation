import { replaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'
import { processPairs } from '../shared/converter-utils.ts'

export { replaces } from './replaces.ts'
export const converterName = '8th inverted doubles in triplets'
export const pattern = replaces['10'][0]

/** Convert to 8th inverted doubles in triplets */
export function convert(accentMap8: Accent[]): Sticking[] {
  return processPairs(accentMap8, replaces)
}
