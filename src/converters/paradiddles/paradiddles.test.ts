import { describe, it, expect } from 'vitest'
import { convertToParadiddles } from './index.ts'
import type { Accent } from '../../types.ts'

const paradiddleTypes = [
  'paradiddle_single_accent',
  'paradiddle_double_accent',
  'invert_paradiddle_single_accent',
  'invert_paradiddle_double_accent',
  'invert_paradiddle_kick',
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
      invert_paradiddle_kick: 'rllr rllr rllr rllr',
    },
  },
  {
    name: 'Все единицы [1,1,1,1,1,1,1,1]',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'RlRl RlRl RlRl RlRl',
      paradiddle_double_accent: 'RlRl RlRl RlRl RlRl',
      invert_paradiddle_single_accent: 'RlRl RlRl RlRl RlRl',
      invert_paradiddle_double_accent: 'RlRl RlRl RlRl RlRl',
      invert_paradiddle_kick: 'RlRl RlRl RlRl RlRl',
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
      invert_paradiddle_kick: 'Rllk Rllk Rllk Rllk',
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
      invert_paradiddle_kick: 'rkLr rkLr rkLr rkLr',
    },
  },
  {
    name: 'Парные единицы [1,1,0,0,1,1,0,0]',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'RlRl rrll RlRl rrll',
      paradiddle_double_accent: 'RlRL rrll RlRL rrll',
      invert_paradiddle_single_accent: 'RlRl lrrl RlRl lrrl',
      invert_paradiddle_double_accent: 'RlRl lrrL RlRl lrrL',
      invert_paradiddle_kick: 'RlRl lrrk LrLr rllk',
    },
  },
  {
    name: 'Парные нули [0,0,1,1,0,0,1,1]',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'rrll RlRl rrll RlRl',
      paradiddle_double_accent: 'rrll RlRL rrll RlRL',
      invert_paradiddle_single_accent: 'rllr LrLr rllr LrLr',
      invert_paradiddle_double_accent: 'rllR LrLr rllR LrLr',
      invert_paradiddle_kick: 'rllk RlRl lrrk LrLr',
    },
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
    isMirrored: {
      paradiddle_single_accent: true,
      paradiddle_double_accent: true,
      invert_paradiddle_single_accent: true,
      invert_paradiddle_double_accent: true,
      invert_paradiddle_kick: false,
    },
    expected: {
      paradiddle_single_accent: 'Rlrr llrr llrr llrr',
      paradiddle_double_accent: 'RLrr llrr llrr llrr',
      invert_paradiddle_single_accent: 'Rllr rllr rllr rllr',
      invert_paradiddle_double_accent: 'Rllr rllr rllr rllR',
      invert_paradiddle_kick: 'Rllr rllr rllr rllk',
    },
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
    isMirrored: {
      paradiddle_single_accent: true,
      paradiddle_double_accent: true,
      invert_paradiddle_single_accent: true,
      invert_paradiddle_double_accent: true,
      invert_paradiddle_kick: false,
    },
    expected: {
      paradiddle_single_accent: 'Rlrr llrr Lrll Rlrr',
      paradiddle_double_accent: 'RLrr llrr LRll RLrr',
      invert_paradiddle_single_accent: 'Rllr rllr Lrrl Rllr',
      invert_paradiddle_double_accent: 'Rllr rllR LrrL RllR',
      invert_paradiddle_kick: 'Rllr rllk Rllk Rllk',
    },
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
    isMirrored: false,
    expected: {
      paradiddle_single_accent: 'Rlrr llRl Rlrr llRl',
      paradiddle_double_accent: 'RLrr llRl RLrr llRl',
      invert_paradiddle_single_accent: 'Rllr rlRl Rllr rlRl',
      invert_paradiddle_double_accent: 'Rllr rLRl Rllr rLRl',
      invert_paradiddle_kick: 'Rllr rkLr Lrrl lkRl',
    },
  },
  {
    name: 'Паттерн [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
    isMirrored: {
      paradiddle_single_accent: true,
      paradiddle_double_accent: true,
      invert_paradiddle_single_accent: true,
      invert_paradiddle_double_accent: true,
      invert_paradiddle_kick: false,
    },
    expected: {
      paradiddle_single_accent: 'rrLr llrr llrr llrr',
      paradiddle_double_accent: 'rrLR llrr llrr llrr',
      invert_paradiddle_single_accent: 'rlRl lrrl lrrl lrrl',
      invert_paradiddle_double_accent: 'rLRl lrrl lrrl lrrl',
      invert_paradiddle_kick: 'rkLr rllr rllr rllr',
    },
  },
]

describe('convertToParadiddles', () => {
  testCases.forEach(testCase => {
    describe(testCase.name, () => {
      paradiddleTypes.forEach(type => {
        it(`${type}`, () => {
          const result = convertToParadiddles(testCase.input as Accent[], type)
          expect(result.bars[0]).toBe(testCase.expected[type])
          const expectedMirrored =
            typeof testCase.isMirrored === 'object'
              ? testCase.isMirrored[type]
              : testCase.isMirrored
          expect(result.isMirrored).toBe(expectedMirrored)
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
