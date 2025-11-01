import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

const expectations = [
  'rrllrrllrrllrrll', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RLrrLRllRLrrLRll', // Чередование с 1
  'rrLRllRLrrLRllRL', // Чередование с 0
  'RlRLrrllRlRLrrll', // Парные единицы
  'rrllRlRLrrllRlRL', // Парные нули
  'RLrrllrrllrrllrr', // Паттерн [1,0,0,0,0,0,0,0]
  'RLrrllrrLRllRLrr', // Паттерн [1,0,0,0,1,0,1,0]
  'RLrrllRlRLrrllRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rrLRllrrllrrllrr', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-paradiddle-double-accent', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.join('')).toBe(expectations[index])
      })
    })
  })
})
