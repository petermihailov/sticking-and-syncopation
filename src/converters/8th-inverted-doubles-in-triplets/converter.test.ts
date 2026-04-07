import { describe, it, expect } from 'vitest'
import { convert } from './index'
import type { Accent } from '../../types'
import { standardTestInputs } from '../shared/test-cases'

const expectations = [
  'rrllrrllrrll', // Все нули
  'RlRLrLRlRLrL', // Все единицы
  'RllRllRllRll', // Чередование с 1
  'rrLrrLrrLrrL', // Чередование с 0
  'RlRllrLrLrrl', // Парные единицы
  'rrlRlRllrLrL', // Парные нули
  'Rllrrllrrllr', // Паттерн [1,0,0,0,0,0,0,0]
  'RllrrlRllRll', // Паттерн [1,0,0,0,1,0,1,0]
  'RllrrLRllrrL', // Паттерн [1,0,0,1,1,0,0,1]
  'rrLrrllrrllr', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('8th-inverted-doubles-in-triplets', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })
})
