import type { ConvertResult, Sticking } from '../types'

export function generateHandToHandNotation(
  convertResult: ConvertResult
): string {
  // Извлекаем символы палочек из результата (12 символов для триолей)
  const stickings = convertResult.stickings || ['r', 'l', 'r', 'l', 'r', 'l', 'r', 'l', 'r', 'l', 'r', 'l']

  // Создаем ноты с акцентами для триолей
  const notes = stickings.map((sticking: Sticking) => {
    const isAccent = sticking === 'R' || sticking === 'L'
    const baseNote = isAccent ? '!>!c/1' : 'c/1'
    return baseNote
  })

  // Группируем триоли по 3 для каждой четверти (4 группы по 3 ноты)
  const noteGroups = []
  for (let i = 0; i < notes.length; i += 3) {
    const group = notes.slice(i, i + 3)
    noteGroups.push(`(3${group.join('')}`)
  }

  const kickPattern = 'F2 F2 F2 F2'

  return `X:Hand to Hand Triplets
L:1/12
M:3/4
%%staves (1 2)
V:1 clef=none stem=up
|: ${noteGroups.join(' ')} :|
V:2 clef=none stem=down
|: ${kickPattern} :|`
}