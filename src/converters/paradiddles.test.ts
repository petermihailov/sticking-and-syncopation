import { describe, it, expect } from 'vitest'
import { convertToParadiddles } from './paradiddles'
import type { Accent } from '../types'

const paradiddleTypes = [
  'paradiddle_single_accent',
  'paradiddle_double_accent',
  'invert_paradiddle_single_accent',
  'invert_paradiddle_double_accent',
] as const

const testCases = [
  {
    name: 'Все нули [0,0,0,0,0,0,0,0]',
    input: [0, 0, 0, 0, 0, 0, 0, 0],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'rrll rrll rrll rrll',
      paradiddle_double_accent: 'rrll rrll rrll rrll',
      invert_paradiddle_single_accent: 'rllr rllr rllr rllr',
      invert_paradiddle_double_accent: 'rllr rllr rllr rllr',
    },
  },
  {
    name: 'Все единицы [1,1,1,1,1,1,1,1]',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'RlRl RlRl RlRl RlRl',
      paradiddle_double_accent: 'RLRL RLRL RLRL RLRL',
      invert_paradiddle_single_accent: 'RlRl RlRl RlRl RlRl',
      invert_paradiddle_double_accent: 'RLRL RLRL RLRL RLRL',
    },
  },
  {
    name: 'Чередование с 1 [1,0,1,0,1,0,1,0]',
    input: [1, 0, 1, 0, 1, 0, 1, 0],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'Rlrr Lrll Rlrr Lrll',
      paradiddle_double_accent: 'RLrr LRll RLrr LRll',
      invert_paradiddle_single_accent: 'Rllr Lrrl Rllr Lrrl',
      invert_paradiddle_double_accent: 'RllR LrrL RllR LrrL',
    },
  },
  {
    name: 'Чередование с 0 [0,1,0,1,0,1,0,1]',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'rrLr llRl rrLr llRl',
      paradiddle_double_accent: 'rrLR llRL rrLR llRL',
      invert_paradiddle_single_accent: 'rlRl lrLr rlRl lrLr',
      invert_paradiddle_double_accent: 'rLRl lRLr rLRl lRLr',
    },
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'RlRl rrll RlRl rrll',
      paradiddle_double_accent: 'RLRL rrll RLRL rrll',
      invert_paradiddle_single_accent: 'RlRl lrrl RlRl lrrl',
      invert_paradiddle_double_accent: 'RlRl lrrL RlRl lrrL',
    },
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'rrll RlRl rrll RlRl',
      paradiddle_double_accent: 'rrll RLRL rrll RLRL',
      invert_paradiddle_single_accent: 'rllr LrLr rllr LrLr',
      invert_paradiddle_double_accent: 'rllR LrLr rllR LrLr',
    },
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    isMirrored: true,
    expected: {
      paradiddle_single_accent: 'Rlrr llrr llrr llrr',
      paradiddle_double_accent: 'RLrr llrr llrr llrr',
      invert_paradiddle_single_accent: 'Rllr rllr rllr rllr',
      invert_paradiddle_double_accent: 'Rllr rllr rllr rllR',
    },
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    isMirrored: true,
    expected: {
      paradiddle_single_accent: 'Rlrr llrr Lrll Rlrr',
      paradiddle_double_accent: 'RLrr llrr LRll RLrr',
      invert_paradiddle_single_accent: 'Rllr rllr Lrrl Rllr',
      invert_paradiddle_double_accent: 'Rllr rllR LrrL RllR',
    },
  },
  // {
  //   name: 'Паттерн [1,0,0,1,1,0,0,1]',
  //   input: [1, 0, 0, 1, 1, 0, 0, 1],
  //   expected: {
  //     paradiddle_single_accent: 'Rlrr llRl Rlrr llRl',
  //     paradiddle_double_accent: 'RLrr llRL RLrr llRL',
  //     invert_paradiddle_single_accent: 'Rllr rlRl Rllr rlRl',
  //     invert_paradiddle_double_accent: 'Rllr rLRL Rllr rLRL',
  //   },
  // },
]

describe('convertToParadiddles', () => {
  testCases.forEach(testCase => {
    describe(testCase.name, () => {
      paradiddleTypes.forEach(type => {
        it(`${type}`, () => {
          const result = convertToParadiddles(testCase.input as Accent[], type)
          expect(result.bars[0]).toBe(testCase.expected[type])
          expect(result.isMirrored).toBe(testCase.isMirrored)
        })
      })
    })
  })

  describe('error handling', () => {
    it('should throw error for invalid input length', () => {
      expect(() => {
        convertToParadiddles([1, 0, 1] as Accent[], 'paradiddle_single_accent')
      }).toThrow('accentMap8 must have exactly 8 elements')
    })
  })
})
