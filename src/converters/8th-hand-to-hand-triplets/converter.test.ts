import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'

const testCases = [
  {
    name: 'Все нули [0,0,0,0,0,0,0,0]',
    input: [0, 0, 0, 0, 0, 0, 0, 0],
    expected: 'rlrlrlrlrlrl',
  },
  {
    name: 'Все единицы [1,1,1,1,1,1,1,1]',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
    expected: 'RlRLrLRlRLrL',
  },
  {
    name: 'Чередование с 1 [1,0,1,0,1,0,1,0]',
    input: [1, 0, 1, 0, 1, 0, 1, 0],
    expected: 'RlrLrlRlrLrl',
  },
  {
    name: 'Чередование с 0 [0,1,0,1,0,1,0,1]',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
    expected: 'rlRlrLrlRlrL',
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    expected: 'RlRlrlRlRlrl',
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    expected: 'rlrLrLrlrLrL',
  },
  {
    name: 'Первый акцент [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    expected: 'Rlrlrlrlrlrl',
  },
  {
    name: 'Первый& акцент [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
    expected: 'rlRlrlrlrlrl',
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    expected: 'RlrlrlRlrLrl',
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
    expected: 'RlrlrLRlrlrL',
  },
]

describe('convertHandToHand', () => {
  testCases.forEach(testCase => {
    it(testCase.name, () => {
      const result = convert(testCase.input as Accent[])
      const resultString = result.join('')
      expect(resultString).toBe(testCase.expected)
    })
  })

  describe('error handling', () => {
    it('should handle input with odd length by padding with 0', () => {
      const result = convert([1, 0, 1] as Accent[])
      expect(result.length).toBe(12)
      expect(result.join('')).toBe('RlrLrlrlrlrl')
    })
  })
})
