import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import { createFormattedBars } from './formatter.ts'
import type { Accent } from '../../types.ts'

const testCases = [
  {
    name: 'Все нули [0,0,0,0,0,0,0,0]',
    input: [0, 0, 0, 0, 0, 0, 0, 0],
    expected: 'rrll rrll rrll rrll',
  },
  {
    name: 'Все единицы [1,1,1,1,1,1,1,1]',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
    expected: 'RlRl RlRl RlRl RlRl',
  },
  {
    name: 'Чередование с 1 [1,0,1,0,1,0,1,0]',
    input: [1, 0, 1, 0, 1, 0, 1, 0],
    expected: 'RLrr LRll RLrr LRll',
  },
  {
    name: 'Чередование с 0 [0,1,0,1,0,1,0,1]',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
    expected: 'rrLR llRL rrLR llRL',
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    expected: 'RlRL rrll RlRL rrll',
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    expected: 'rrll RlRL rrll RlRL',
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    expected: 'RLrr llrr llrr llrr',
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    expected: 'RLrr llrr LRll RLrr',
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
    expected: 'RLrr llRl RLrr llRl',
  },
  {
    name: 'Паттерн [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
    expected: 'rrLR llrr llrr llrr',
  },
]

describe('16th-paradiddle-double-accent', () => {
  testCases.forEach(testCase => {
    it(testCase.name, () => {
      const bar = convert(testCase.input as Accent[])
      const result = createFormattedBars(bar, testCase.input as Accent[])
      expect(result[0]).toBe(testCase.expected)
    })
  })
})
