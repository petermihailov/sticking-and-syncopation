export function generateAccentNotation(checkedItems: boolean[]): string {
  // Малый барабан - паттерн из checkedItems
  const snareNotes = checkedItems.map(checked => {
    return checked ? 'c' : 'z' // B = нота на средней линии, x = невидимая нота
  })

  // Группируем по 2 ноты (группы восьмых в четвертях)
  const snareGroups = []
  for (let i = 0; i < snareNotes.length; i += 2) {
    const group = snareNotes.slice(i, i + 2)
    snareGroups.push(group.join(''))
  }

  // Басовый барабан четвертями
  const kickPattern = 'F2 F2 F2 F2' // F2 = четвертная нота

  return `X:Accents
L:1/8
K:C
%%staves (1 2)
V:1 clef=none stem=up
|: ${snareGroups.join(' ')} :|
V:2 clef=none stem=down
|: ${kickPattern} :|`
}
