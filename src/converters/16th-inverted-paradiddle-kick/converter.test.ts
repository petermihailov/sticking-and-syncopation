import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

const expectations = [
  'rllrrlrlrlrlrlrl', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RllkLrrkLrrkLrrk', // Чередование с 1
  'rkLrrkLrrkLrrkLr', // Чередование с 0
  'RlRllrrkLrLrrlrk', // Парные единицы
  'rllkLrLrrlrkLrLr', // Парные нули
  'Rllrrlrlrlrlrlrk', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrlrkLrrkLrrk', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrkLrLrrlrkLr', // Паттерн [1,0,0,1,1,0,0,1]
  'rkLrrlrlrlrlrlrl', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-invert-paradiddle-kick', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.join('')).toBe(expectations[index])
      })
    })
  })
})
