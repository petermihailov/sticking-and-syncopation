import type { ParadiddleResult } from '../converters/paradiddles'

export function generateRudimentNotation(
  convertResult: ParadiddleResult
): string {
  // Извлекаем символы палочек из результата
  const firstBar = convertResult.bars[0].replace(/\s/g, '') // Убираем пробелы

  // Создаем ноты с акцентами, ghost notes и sticking аннотациями
  const notes = firstBar.split('').map(char => {
    const isAccent = char === char.toUpperCase() // Большая буква = акцент
    const baseNote = isAccent ? '!>!c/2' : 'c/2' // /2 = шестнадцатая нота
    // const hand = char.toUpperCase() // R или L
    // return `_"${hand}"${baseNote}` // Добавляем sticking
    return baseNote
  })

  // Группируем ноты по 4 для четвертей
  const noteGroups = []
  for (let i = 0; i < notes.length; i += 4) {
    const group = notes.slice(i, i + 4)
    noteGroups.push(group.join(''))
  }

  // Басовый барабан - каждый 4-й удар (позиции 1, 5, 9, 13)
  const kickPattern = 'F2 F2 F2 F2'

  return `X:Pattern
L:1/16
M:4/4
%%staves (1 2)
V:1 clef=none stem=up
"I play:"|: ${noteGroups.join(' ')} :|
V:2 clef=none stem=down
|: ${kickPattern} :|`
}
