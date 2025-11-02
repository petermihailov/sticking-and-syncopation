import type { ConvertResult, Sticking } from '../types'

export function generate16thHandToHandNotation(
  convertResult: ConvertResult
): string {
  // Извлекаем символы палочек из результата (24 символа для 16th триолей)
  const stickings = convertResult.bars[0] || []

  // Создаем ноты с акцентами для триолей
  const notes = stickings.map((sticking: Sticking) => {
    // Пропускаем паузы
    if (sticking === ' ') {
      return 'z/1'
    }
    const isAccent = sticking === 'R' || sticking === 'L'
    const baseNote = isAccent ? '!>!c/1' : 'c/1'
    return baseNote
  })

  // Группируем триоли по 6 для каждой четверти (4 группы по 6 нот)
  const noteGroups = []
  for (let i = 0; i < notes.length; i += 6) {
    const group = notes.slice(i, i + 6)
    noteGroups.push(`(6${group.join('')}`)
  }

  const kickPattern = 'F2 F2 F2 F2'

  return `X:16th Hand to Hand Triplets
L:1/24
M:3/4
%%staves (1 2)
V:1 clef=none stem=up
|: ${noteGroups.join(' ')} :|
V:2 clef=none stem=down
|: ${kickPattern} :|`
}
