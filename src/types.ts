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

export type RudimentType =
  | '16th-paradiddle-single-accent'
  | '16th-paradiddle-double-accent'
  | '16th-invert-paradiddle-single-accent'
  | '16th-invert-paradiddle-double-accent'
  | '16th-invert-paradiddle-kick'
  | '8th-hand-to-hand-triplets'
  | '32th-hand-to-hand-triplets'
  | '8th-inverted-doubles-in-triplets'
