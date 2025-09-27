import type { Accent } from '../../../types.ts'
import { BAR_LENGTH } from '../../constants.ts'

export function validateInput(accentMap8: Accent[]): void {
  if (accentMap8.length !== BAR_LENGTH) {
    throw new Error(`accentMap8 must have exactly ${BAR_LENGTH} elements`)
  }
}

export function hasInvalidTransitions() {}
