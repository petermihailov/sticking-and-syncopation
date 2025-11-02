import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

const expectations = [
  'rllrrllrrllrrllr', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RllkRllkRllkRllk', // Чередование с 1
  'rkRllkRllkRllkRl', // Чередование с 0
  'RlRllrrkRlRllrrk', // Парные единицы
  'rllkRlRllrrkRlRl', // Парные нули
  'Rllrrllrrllrrllk', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrllkRllkRllk', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrkRlRllrrkRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rkRllrrllrrllrrl', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-inverted-paradiddle-kick-right-accent', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })
})
