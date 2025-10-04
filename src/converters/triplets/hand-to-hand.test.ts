import { describe, it, expect } from 'vitest'
import { convertHandToHand } from './hand-to-hand.ts'
import type { Accent } from '../../types.ts'

const testCases = [
  {
    name: 'Все нули [0,0,0,0,0,0,0,0]',
    input: [0, 0, 0, 0, 0, 0, 0, 0],
    expected: 'rlrlrlrlrlrl', // 00,00,00,00 -> 000,000,000,000
  },
  {
    name: 'Все единицы [1,1,1,1,1,1,1,1]',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
    expected: 'RlRLrLRlRLrL', // 11,11,11,11 -> 101,101,101,101
  },
  {
    name: 'Чередование с 1 [1,0,1,0,1,0,1,0]',
    input: [1, 0, 1, 0, 1, 0, 1, 0],
    expected: 'RlrLrlRlrLrl', // 10,10,10,10 -> 100,100,100,100
  },
  {
    name: 'Чередование с 0 [0,1,0,1,0,1,0,1]',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
    expected: 'rlRlrLrlRlrL', // 01,01,01,01 -> 001,001,001,001
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    expected: 'RlRlrlRlRlrl', // 11,00,11,00 -> 101,000,101,000
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    expected: 'rlrLrLrlrLrL', // 00,11,00,11 -> 000,101,000,101
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    expected: 'Rlrlrlrlrlrl', // 10,00,00,00 -> 100,000,000,000
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    expected: 'RlrlrlRlrLrl', // 10,00,10,10 -> 100,000,100,100
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
    expected: 'RlrlrLRlrlrL', // 10,01,10,01 -> 100,001,100,001
  },
  {
    name: 'Паттерн [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
    expected: 'rlRlrlrlrlrl', // 01,00,00,00 -> 001,000,000,000
  },
]

describe('convertHandToHand', () => {
  testCases.forEach(testCase => {
    it(testCase.name, () => {
      const result = convertHandToHand(testCase.input as Accent[])
      const resultString = result.join('')
      expect(resultString).toBe(testCase.expected)
    })
  })

  describe('error handling', () => {
    it('should handle input with odd length by padding with 0', () => {
      const result = convertHandToHand([1, 0, 1] as Accent[])
      expect(result.length).toBe(12)
      // 10,10 -> 100,100 -> RlrLrlrlrlrl
      expect(result.join('')).toBe('RlrLrlrlrlrl')
    })
  })
})