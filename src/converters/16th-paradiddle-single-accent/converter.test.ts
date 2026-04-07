import { describe, it, expect } from 'vitest'
import { convert } from './index'
import type { Accent } from '../../types'
import { standardTestInputs } from '../shared/test-cases'

const expectations = [
  'rrllrrllrrllrrll', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RlrrLrllRlrrLrll', // Чередование с 1
  'rrLrllRlrrLrllRl', // Чередование с 0
  'RlRlrrllRlRlrrll', // Парные единицы
  'rrllRlRlrrllRlRl', // Парные нули
  'Rlrrllrrllrrllrr', // Паттерн [1,0,0,0,0,0,0,0]
  'RlrrllrrLrllRlrr', // Паттерн [1,0,0,0,1,0,1,0]
  'RlrrllRlRlrrllRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rrLrllrrllrrllrr', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-paradiddle-single-accent', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })
})
