import { describe, it, expect } from 'vitest'
import { convert } from './index'
import type { Accent } from '../../types'
import { standardTestInputs } from '../shared/test-cases'

const expectations = [
  'rllrrllrrllrrllr', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RllkRllkRllkRllk', // Чередование с 1
  'rkLrrkLrrkLrrkLr', // Чередование с 0
  'RlRllrrkLrLrrllk', // Парные единицы
  'rllkRlRllrrkLrLr', // Парные нули
  'Rllrrllrrllrrllk', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrllkRllkRllk', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrkLrLrrllkRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rkLrrllrrllrrllr', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-invert-paradiddle-kick', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })
})
