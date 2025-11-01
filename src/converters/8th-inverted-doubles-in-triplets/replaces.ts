import type { StickingPattern } from '../../types.ts'

export const replaces = {
  '00': ['rrl', 'rll', 'llr', 'lrr'] as StickingPattern[],
  '01': ['rrL', 'rlR', 'llR', 'lrL'] as StickingPattern[],
  '10': ['Rll', 'Lrr'] as StickingPattern[],
  '11': ['RlR', 'LrL'] as StickingPattern[],
}
