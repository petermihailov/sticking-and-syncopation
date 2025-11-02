import type { ConvertResult } from '../../types.ts'

export function generateNotation(convertResult: ConvertResult): string {
  const barString = convertResult.bars[0].join('').replace(/\s/g, '')
  const hasKick = barString.includes('k')

  const notes = barString.split('').map(char => {
    const isAccent = char === char.toUpperCase()
    const isKick = char === 'k'

    let baseNote = isAccent ? '!>!c/2' : 'c/2'
    baseNote = isKick ? 'F/2' : baseNote

    return baseNote
  })

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
