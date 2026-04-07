import type { StickingPattern } from '../../types'

export const replaces = {
  '00': ['rrllrr', 'llrrll'] as StickingPattern[],
  '01': ['rrllR ', 'llrrL '] as StickingPattern[],
  '10': ['R llrr', 'L rrll'] as StickingPattern[],
  '11': ['R llR ', 'L rrL '] as StickingPattern[],
}
