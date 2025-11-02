import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

const expectations = [
  'rllrrllrrllrrllr', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RllRLrrLRllRLrrL', // Чередование с 1
  'rLRllRLrrLRllRLr', // Чередование с 0
  'RlRllrrLRlRllrrL', // Парные единицы
  'rllRLrLrrllRLrLr', // Парные нули
  'RllrrllrrllrrllR', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrllRLrrLRllR', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrLRlRllrrLRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rLRllrrllrrllrrl', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-invert-paradiddle-double-accent', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })
})
