import { describe, it, expect } from 'vitest'
import { convert } from './index.ts'
import { createFormattedBars } from './formatter.ts'
import type { Accent } from '../../types.ts'

const testCases = [
  {
    name: 'Все нули [0,0,0,0,0,0,0,0]',
    input: [0, 0, 0, 0, 0, 0, 0, 0],
    expected: 'rllr rllr rllr rllr',
  },
  {
    name: 'Все единицы [1,1,1,1,1,1,1,1]',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
    expected: 'RlRl RlRl RlRl RlRl',
  },
  {
    name: 'Чередование с 1 [1,0,1,0,1,0,1,0]',
    input: [1, 0, 1, 0, 1, 0, 1, 0],
    expected: 'Rllk Rllk Rllk Rllk',
  },
  {
    name: 'Чередование с 0 [0,1,0,1,0,1,0,1]',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
    expected: 'rkRl lkRl lkRl lkRl',
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    expected: 'RlRl lrrk RlRl lrrk',
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    expected: 'rllk RlRl lrrk RlRl',
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    expected: 'Rllr rllr rllr rllk',
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    expected: 'Rllr rllk Rllk Rllk',
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
    expected: 'Rllr rkRl Rllr rkRl',
  },
  {
    name: 'Паттерн [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
    expected: 'rkRl lrrl lrrl lrrl',
  },
]

describe('16th-invert-paradiddle-kick', () => {
  testCases.forEach(testCase => {
    it(testCase.name, () => {
      const bar = convert(testCase.input as Accent[])
      const result = createFormattedBars(bar, testCase.input as Accent[])
      expect(result[0]).toBe(testCase.expected)
    })
  })
})
