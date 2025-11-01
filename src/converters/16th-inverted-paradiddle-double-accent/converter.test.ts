import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import type { Accent } from '../../types.ts'

const testCases = [
  {
    name: 'Все нули [0,0,0,0,0,0,0,0]',
    input: [0, 0, 0, 0, 0, 0, 0, 0],
    expected: 'rllrrlrlrlrlrlrl',
  },
  {
    name: 'Все единицы [1,1,1,1,1,1,1,1]',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
    expected: 'RlRlRlRlRlRlRlRl',
  },
  {
    name: 'Чередование с 1 [1,0,1,0,1,0,1,0]',
    input: [1, 0, 1, 0, 1, 0, 1, 0],
    expected: 'RllRLrrLRlrLRlrL',
  },
  {
    name: 'Чередование с 0 [0,1,0,1,0,1,0,1]',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
    expected: 'rLRllRLrrLRlrLRl',
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    expected: 'RlRllrrLRlRlrlrL',
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    expected: 'rllRLrLrrlrLRlRl',
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    expected: 'RllrrlrlrlrlrlrL',
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    expected: 'RllrrlrLRlrLRlrL',
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
    expected: 'RllrrLRlRlrlrLRl',
  },
  {
    name: 'Паттерн [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
    expected: 'rLRllrrlrlrlrlrl',
  },
]

describe('16th-invert-paradiddle-double-accent', () => {
  testCases.forEach(testCase => {
    it(testCase.name, () => {
      const result = convert(testCase.input as Accent[])
      expect(result.join('')).toBe(testCase.expected)
    })
  })
})
