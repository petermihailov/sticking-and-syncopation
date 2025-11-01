export type Sticking = 'R' | 'L' | 'r' | 'l' | 'k' | ' '
export type Sticking2 = `${Sticking}${Sticking}`
export type Sticking3 = `${Sticking}${Sticking}${Sticking}`
export type Sticking4 = `${Sticking}${Sticking}${Sticking}${Sticking}`
export type Sticking6 =
  `${Sticking}${Sticking}${Sticking}${Sticking}${Sticking}${Sticking}`

export type StickingPattern = Sticking2 | Sticking3 | Sticking4 | Sticking6

export type Accent = 0 | 1

/**
 * Result of converting accent pattern to sticking pattern
 */
export interface ConvertResult {
  stickings: Sticking[]
  isMirrored: boolean
}
