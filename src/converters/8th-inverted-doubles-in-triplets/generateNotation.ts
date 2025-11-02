import type { ConvertResult, Sticking } from '../../types.ts'

export function generateNotation(convertResult: ConvertResult): string {
  const stickings = convertResult.bars[0] || ['r', 'l', 'r', 'l', 'r', 'l', 'r', 'l', 'r', 'l', 'r', 'l']

  const notes = stickings.map((sticking: Sticking) => {
    const isAccent = sticking === 'R' || sticking === 'L'
    const baseNote = isAccent ? '!>!c/1' : 'c/1'
    return baseNote
  })

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
