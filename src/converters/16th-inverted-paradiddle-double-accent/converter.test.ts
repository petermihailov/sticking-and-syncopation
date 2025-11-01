import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

const expectations = [
  'rllrrlrlrlrlrlrl', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RllRLrrLRlrLRlrL', // Чередование с 1
  'rLRllRLrrLRlrLRl', // Чередование с 0
  'RlRllrrLRlRlrlrL', // Парные единицы
  'rllRLrLrrlrLRlRl', // Парные нули
  'RllrrlrlrlrlrlrL', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrlrLRlrLRlrL', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrLRlRlrlrLRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rLRllrrlrlrlrlrl', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-invert-paradiddle-double-accent', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.join('')).toBe(expectations[index])
      })
    })
  })
})
