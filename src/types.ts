export type Sticking = 'R' | 'L' | 'r' | 'l' | 'k'
export type Sticking2 = `${Sticking}${Sticking}`
export type Sticking3 = `${Sticking}${Sticking}${Sticking}`
export type Sticking4 = `${Sticking}${Sticking}${Sticking}${Sticking}`

export type StickingPattern = Sticking2 | Sticking3 | Sticking4

export type Accent = 0 | 1

export type RudimentType =
  | 'paradiddle_single_accent'
  | 'paradiddle_double_accent'
  | 'invert_paradiddle_single_accent'
  | 'invert_paradiddle_double_accent'
  | 'invert_paradiddle_kick'
  | 'hand_to_hand_triplets'
