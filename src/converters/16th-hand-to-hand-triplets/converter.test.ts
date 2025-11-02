import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'
import { standardTestInputs } from '../shared/test-cases.ts'

const expectations = [
  'rrllrrllrrllrrllrrllrrll', // Все нули
  'R llR L rrL R llR L rrL ', // Все единицы
  'R llrrL rrllR llrrL rrll', // Чередование с 1
  'rrllR llrrL rrllR llrrL ', // Чередование с 0
  'R llR llrrllR llR llrrll', // Парные единицы
  'rrllrrL rrL rrllrrL rrL ', // Парные нули
  'R llrrllrrllrrllrrllrrll', // Паттерн [1,0,0,0,0,0,0,0]
  'R llrrllrrllR llrrL rrll', // Паттерн [1,0,0,0,1,0,1,0]
  'R llrrllrrL R llrrllrrL ', // Паттерн [1,0,0,1,1,0,0,1]
  'rrllR llrrllrrllrrllrrll', // Паттерн [0,1,0,0,0,0,0,0]
]

describe('16th-hand-to-hand-triplets', () => {
  describe('standard patterns', () => {
    standardTestInputs.forEach((testInput, index) => {
      it(testInput.name, () => {
        const result = convert(testInput.input as Accent[])
        expect(result.bar1.join('')).toBe(expectations[index])
      })
    })
  })
})
