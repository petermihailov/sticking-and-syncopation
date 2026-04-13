import type { Hand, Instrument } from './instrument'
import type { InstrumentVoice } from './sticking'

// Такт в формате готовом для воспроизведения.
// rhythm[i] — список voices, играющихся одновременно на субдивизии i.
// Voices создаёт StickingResolver: он применяет политику (gain ghost, pitch r/l)
// к именам инструментов из StickingMapping.
export interface Bar {
  rhythm: InstrumentVoice[][]
  // Исходные символы стикинга (для отображения), опционально.
  stickings?: string[]
  // Рука на каждой субдивизии (для подсветки нот), опционально.
  hands?: Hand[]
  // Флэм перед нотой на каждой субдивизии, опционально.
  flams?: boolean[]
  beatsPerBar: number
  noteValue: number
  timeDivision: number
}

// Утилита: извлечь имена инструментов из voice-такта (для UI/тестов).
export function instrumentsAt(bar: Bar, rhythmIndex: number): Instrument[] {
  return (bar.rhythm[rhythmIndex] ?? []).map(v => v.instrument)
}
