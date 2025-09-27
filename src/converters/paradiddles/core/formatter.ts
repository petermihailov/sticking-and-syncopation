import type { Sticking } from '../../../types.ts'
import { flipHands, isAccented } from '../utils/hand-utils.ts'

export function createFormattedBars(
  bar: Sticking[],
  includeMirrored: boolean
): string[] {
  const bars = [formatBar(bar)]

  if (includeMirrored) {
    const mirroredBar = flipHands(bar)
    bars.push(formatBar(mirroredBar))
  }

  return bars
}

export function formatBar(bar: Sticking[]): string {
  const quarters = []
  for (let i = 0; i < bar.length; i += 4) {
    quarters.push(bar.slice(i, i + 4).join(''))
  }
  return quarters.join(' ')
}

export function shouldCreateMirroredBar(bar: Sticking[]): boolean {
  if (bar.length === 0) return false

  const first = bar[0]
  const last = bar[bar.length - 1]

  const firstHand = first.toLowerCase()
  const lastHand = last.toLowerCase()
  const firstAccented = isAccented(first)
  const lastAccented = isAccented(last)

  return (
    firstHand === lastHand &&
    (firstAccented !== lastAccented || (firstAccented && lastAccented))
  )
}