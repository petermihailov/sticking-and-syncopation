import { describe, it, expect } from 'vitest'
import { convert } from './index'
import type { Accent } from '../../types'
import { standardTestInputs } from '../shared/test-cases'

const expectations = [
  'rllrrllrrllrrllr', // Все нули
  'RlRlRlRlRlRlRlRl', // Все единицы
  'RllrLrrlRllrLrrl', // Чередование с 1
  'rlRllrLrrlRllrLr', // Чередование с 0
  'RlRllrrlRlRllrrl', // Парные единицы
  'rllrLrLrrllrLrLr', // Парные нули
  'Rllrrllrrllrrllr', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrllrLrrlRllr', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrlRlRllrrlRl', // Паттерн [1,0,0,1,1,0,0,1]
  'rlRllrrllrrllrrl', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-invert-paradiddle-single-accent', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })
})
