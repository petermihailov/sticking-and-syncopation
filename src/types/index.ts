export type Sticking = 'R' | 'L' | 'r' | 'l' | 'k' | ' '
export type Sticking2 = `${Sticking}${Sticking}`
export type Sticking3 = `${Sticking}${Sticking}${Sticking}`
export type Sticking4 = `${Sticking}${Sticking}${Sticking}${Sticking}`
export type Sticking6 =
  `${Sticking}${Sticking}${Sticking}${Sticking}${Sticking}${Sticking}`

export type StickingPattern = Sticking2 | Sticking3 | Sticking4 | Sticking6

export type Accent = 0 | 1

/**
 * Музыкальный размер для рудимента.
 * - beatsPerBar/noteValue описывают размер (например, 4/4)
 * - notesPerBeat — сколько sticking-символов попадает на одну долю
 *   (4 для 16-х, 3 для 8-х триолей, 6 для 16-х триолей)
 */
export interface Meter {
  beatsPerBar: number
  noteValue: number
  notesPerBeat: number
}

/**
 * Result of converting accent pattern to sticking pattern
 */
export interface ConvertResult {
  bars: Sticking[][]
}
