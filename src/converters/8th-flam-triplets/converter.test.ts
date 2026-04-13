import { describe, it, expect } from 'vitest'
import { convert } from './index'
import type { Accent } from '../../types'
import { standardTestInputs } from '../shared/test-cases'

// Ожидаемые стикинги (без флэм-маркеров)
const expectations = [
  'rlrlrlrlrlrl', // Все нули
  'RlRLrLRlRLrL', // Все единицы
  'RlrLrlRlrLrl', // Чередование с 1
  'rlRlrLrlRlrL', // Чередование с 0
  'RlRlrlRlRlrl', // Парные единицы
  'rlrLrLrlrLrL', // Парные нули
  'Rlrlrlrlrlrl', // Паттерн [1,0,0,0,0,0,0,0]
  'RlrlrlRlrLrl', // Паттерн [1,0,0,0,1,0,1,0]
  'RlrlrLRlrlrL', // Паттерн [1,0,0,1,1,0,0,1]
  'rlRlrlrlrlrl', // Паттерн [0,1,0,0,0,0,0,0]
]

// TODO: ожидаемые флэмы — будут использованы в тестах флэм-проверки
// const flamExpectations = [
//   'ffffffffffff', // Все нули — нет флэмов
//   'FFFFFFFFFF FF', // Все единицы: 'Rl'R 'Lr'L ...
//   'FffFffFffFff', // Чередование с 1: 'Rlr lrl → F..f..
//   'ffFfffffFfff', // Чередование с 0
//   'FfFfffFfFfff', // Парные единицы
//   'fffFfFfffFfF', // Парные нули
//   'Ffffffffffff', // Паттерн [1,0,0,0,0,0,0,0]
//   'FfffffFffFff', // Паттерн [1,0,0,0,1,0,1,0]
//   'FffffFFffffF', // Паттерн [1,0,0,1,1,0,0,1]
//   'ffFfffffffff', // Паттерн [0,1,0,0,0,0,0,0]
// ]

function flamsToString(flams: boolean[]): string {
  return flams.map(f => (f ? 'F' : 'f')).join('')
}

describe('8th-flam-triplets', () => {
  describe('стикинги (без флэм-маркеров)', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })

  describe('флэмы', () => {
    it('все нули — все флэмы false', () => {
      const result = convert(standardTestInputs[0].input as Accent[])
      expect(result.flams1).toBeDefined()
      expect(result.flams1!.every(f => !f)).toBe(true)
    })

    it('все единицы — флэмы на каждой ноте паттерна', () => {
      const result = convert(standardTestInputs[1].input as Accent[])
      // '11' → `'Rl'R` или `'Lr'L` — флэмы на позициях 0 и 2 каждой тройки
      expect(result.flams1).toBeDefined()
      expect(flamsToString(result.flams1!)).toBe('FfFFfFFfFFfF')
    })

    it('чередование 10/10 — флэмы на первой ноте каждой тройки', () => {
      const result = convert(standardTestInputs[2].input as Accent[])
      // '10' → `'Rlr` / `'Lrl`
      expect(result.flams1).toBeDefined()
      expect(flamsToString(result.flams1!)).toBe('FffFffFffFff')
    })

    it('без акцентов (00) — нет массива флэмов', () => {
      const result = convert([0, 0, 0, 0, 0, 0, 0, 0] as Accent[])
      // Все пары '00' → 'rlr'/'lrl' (без флэмов)
      // Но replacesHaveFlams всё равно true, поэтому массив будет, но все false
      expect(result.flams1?.every(f => !f)).toBe(true)
    })
  })
})
