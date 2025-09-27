import type { Accent } from '../../../types.ts'

export function validateInput(accentMap8: Accent[]): void {
  if (accentMap8.length !== 8) {
    throw new Error('accentMap8 must have exactly 8 elements')
  }
}