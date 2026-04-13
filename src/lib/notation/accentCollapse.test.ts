import { describe, it, expect } from 'vitest'
import { collapseAccentPairs } from './accentCollapse'
import type { NoteEvent } from '../../types/notation'

function snare(index: number): NoteEvent {
  return { type: 'snare', accent: false, ghost: false, flam: false, index }
}

function rest(index: number): NoteEvent {
  return { type: 'rest', accent: false, ghost: false, flam: false, index }
}

describe('collapseAccentPairs', () => {
  it('пустой массив → пустой результат', () => {
    expect(collapseAccentPairs([])).toEqual([])
  })

  it('одиночный элемент (нечётное количество) → группа из одной ноты', () => {
    const result = collapseAccentPairs([snare(0)])
    expect(result).toHaveLength(1)
    expect(result[0].notes).toHaveLength(1)
    expect(result[0].notes[0].type).toBe('snare')
  })

  it('snare + rest → четвертная нота', () => {
    const result = collapseAccentPairs([snare(0), rest(1)])
    expect(result).toHaveLength(1)
    expect(result[0].notes).toHaveLength(1)
    expect(result[0].duration).toBe('4')
    expect(result[0].notes[0].type).toBe('snare')
  })

  it('rest + snare → сохраняет обе восьмые', () => {
    const result = collapseAccentPairs([rest(0), snare(1)])
    expect(result).toHaveLength(1)
    expect(result[0].notes).toHaveLength(2)
    expect(result[0].duration).toBeUndefined()
  })

  it('snare + snare → сохраняет обе восьмые', () => {
    const result = collapseAccentPairs([snare(0), snare(1)])
    expect(result).toHaveLength(1)
    expect(result[0].notes).toHaveLength(2)
  })

  it('rest + rest → четвертная пауза', () => {
    const result = collapseAccentPairs([rest(0), rest(1)])
    expect(result).toHaveLength(1)
    expect(result[0].duration).toBe('4')
    expect(result[0].notes[0].type).toBe('rest')
  })

  it('две четвертные паузы подряд → половинная пауза', () => {
    const result = collapseAccentPairs([rest(0), rest(1), rest(2), rest(3)])
    expect(result).toHaveLength(1)
    expect(result[0].duration).toBe('2')
    expect(result[0].notes[0].type).toBe('rest')
  })

  it('все 8 пауз → целая пауза', () => {
    const events = Array.from({ length: 8 }, (_, i) => rest(i))
    const result = collapseAccentPairs(events)
    expect(result).toHaveLength(1)
    expect(result[0].duration).toBe('1')
    expect(result[0].notes[0].type).toBe('rest')
  })

  it('все 8 нот → 4 группы по 2 восьмых', () => {
    const events = Array.from({ length: 8 }, (_, i) => snare(i))
    const result = collapseAccentPairs(events)
    expect(result).toHaveLength(4)
    for (const g of result) {
      expect(g.notes).toHaveLength(2)
      expect(g.duration).toBeUndefined()
    }
  })

  it('четвертная пауза + не-пауза → не сворачиваются в половинную', () => {
    // rest rest | snare rest → четвертная пауза + четвертная нота
    const result = collapseAccentPairs([rest(0), rest(1), snare(2), rest(3)])
    expect(result).toHaveLength(2)
    expect(result[0].duration).toBe('4')
    expect(result[0].notes[0].type).toBe('rest')
    expect(result[1].duration).toBe('4')
    expect(result[1].notes[0].type).toBe('snare')
  })
})
