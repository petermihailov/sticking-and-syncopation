export type Sticking = 'R' | 'L' | 'r' | 'l'

/**
 * Тип для паттернов ударов палочками
 * R/r - правая рука, L/l - левая рука
 * Заглавные буквы обозначают акценты, строчные - обычные удары
 */
export type StickingPattern = `${Sticking}${Sticking}`

export type Accent = 0 | 1

export type RudimentType =
  | 'paradiddle_single_accent'
  | 'paradiddle_double_accent'
  | 'invert_paradiddle_single_accent'
  | 'invert_paradiddle_double_accent'

export type StartHand = 'R' | 'L'

export interface ConvertOutput {
  bars: string[]
  config: {
    offset: number
    startHand: StartHand
    mirroredSecondBar: boolean
  }
}
