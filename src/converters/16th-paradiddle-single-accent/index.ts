import { replaces } from './replaces.ts'
import type { Accent, Sticking } from '../../types.ts'
import { processAccentsSimple } from '../shared/converter-utils.ts'

export { replaces } from './replaces.ts'
export const converterName = '16th paradiddle single accent'
export const pattern = replaces['1'][0] + replaces['0'][0]

/** Convert to 16th paradiddle single accent */
export function convert(accentMap8: Accent[]): Sticking[] {
  return processAccentsSimple(accentMap8, replaces)
}
