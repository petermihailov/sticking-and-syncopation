import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

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

describe('convertHandToHand', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        const resultString = result.join('')
        expect(resultString).toBe(expectations[index])
      })
    })
  })
})
