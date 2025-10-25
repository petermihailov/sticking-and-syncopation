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
    expected: 'RllR LrrL RllR LrrL',
  },
  {
    name: 'Чередование с 0 [0,1,0,1,0,1,0,1]',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
    expected: 'rLRl lRLr rLRl lRLr',
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    expected: 'RlRl lrrL RlRl lrrL',
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    expected: 'rllR LrLr rllR LrLr',
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    expected: 'Rllr rllr rllr rllR',
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    expected: 'Rllr rllR LrrL RllR',
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
    expected: 'Rllr rLRl Rllr rLRl',
  },
  {
    name: 'Паттерн [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
    expected: 'rLRl lrrl lrrl lrrl',
  },
]

describe('16th-invert-paradiddle-double-accent', () => {
  testCases.forEach(testCase => {
    it(testCase.name, () => {
      const bar = convert(testCase.input as Accent[])
      const result = createFormattedBars(bar, testCase.input as Accent[])
      expect(result[0]).toBe(testCase.expected)
    })
  })
})
