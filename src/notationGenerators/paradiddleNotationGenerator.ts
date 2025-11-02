import type { ConvertResult } from '../types.ts'

export function generateParadiddleNotation(
  convertResult: ConvertResult
): string {
  // Извлекаем символы палочек из результата
  const barString = convertResult.bars[0].join('').replace(/\s/g, '') // Убираем пробелы
  const hasKick = barString.includes('k')

  // Создаем ноты с акцентами, ghost notes и sticking аннотациями
  const notes = barString.split('').map(char => {
    const isAccent = char === char.toUpperCase() // Большая буква = акцент
    const isKick = char === 'k'

    let baseNote = isAccent ? '!>!c/2' : 'c/2' // /2 = шестнадцатая нота
    baseNote = isKick ? 'F/2' : baseNote

    return baseNote
  })

  // Группируем ноты по 4 для четвертей
  const noteGroups = []
  for (let i = 0; i < notes.length; i += 4) {
    const group = notes.slice(i, i + 4)
    noteGroups.push(group.join(''))
  }

  if (hasKick) {
    return `X:Pattern
L:1/16
M:4/4
%%staves (1 2)
V:1 clef=none stem=up
|: ${noteGroups.join(' ')} :|`
  }

  // Басовый барабан - каждый 4-й удар
  const kickPattern = 'F2 F2 F2 F2'

  return `X:Pattern
L:1/16
M:4/4
%%staves (1 2)
V:1 clef=none stem=up
|: ${noteGroups.join(' ')} :|
V:2 clef=none stem=down
|: ${kickPattern} :|`
}
