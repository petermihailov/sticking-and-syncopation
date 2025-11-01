import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

const expectations = [
  'rllrrlrlrlrlrlrl', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RllrLrrlRlrlRlrl', // Чередование с 1
  'rlRllrLrrlRlrlRl', // Чередование с 0
  'RlRllrrlRlRlrlrl', // Парные единицы
  'rllrLrLrrlrlRlRl', // Парные нули
  'Rllrrlrlrlrlrlrl', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrlrlRlrlRlrl', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrlRlRlrlrlRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rlRllrrlrlrlrlrl', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-invert-paradiddle-single-accent', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.join('')).toBe(expectations[index])
      })
    })
  })
})
