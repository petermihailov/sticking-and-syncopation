export type Sticking = 'R' | 'L' | 'r' | 'l' | 'k'
export type Sticking2 = `${Sticking}${Sticking}`
export type Sticking3 = `${Sticking}${Sticking}${Sticking}`
export type Sticking4 = `${Sticking}${Sticking}${Sticking}${Sticking}`

export type StickingPattern = Sticking2 | Sticking3 | Sticking4

export type Accent = 0 | 1

export type RudimentType =
  | '16th-paradiddle-single-accent'
  | '16th-paradiddle-double-accent'
  | '16th-invert-paradiddle-single-accent'
  | '16th-invert-paradiddle-double-accent'
  | '16th-invert-paradiddle-kick'
  | '8th-hand-to-hand-triplets'
