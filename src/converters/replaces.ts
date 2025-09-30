import type { StickingPattern } from '../types.ts'

/**
 * Уровни акцентов (0 и 1)
 * "0" - без акцентов или базовый паттерн
 * "1" - с акцентами
 * Каждый уровень содержит массив вариантов
 */
type AccentLevel = {
  '0': StickingPattern[]
  '1': StickingPattern[]
}

/**
 * Основной тип для всей структуры drum rudiments
 * Содержит все виды парадиддлов с их вариациями и уровнями акцентов
 */
type DrumRudiments = {
  paradiddle_single_accent: AccentLevel
  paradiddle_double_accent: AccentLevel
  invert_paradiddle_single_accent: AccentLevel
  invert_paradiddle_double_accent: AccentLevel
}

// JSON data
export const drumRudiments: DrumRudiments = {
  paradiddle_single_accent: {
    '1': ['Rl', 'Lr'],
    '0': ['rr', 'll'],
  },
  paradiddle_double_accent: {
    '1': ['RL', 'LR'],
    '0': ['rr', 'll'],
  },
  invert_paradiddle_single_accent: {
    '1': ['Rl', 'Lr'],
    '0': ['rl', 'lr'],
  },
  invert_paradiddle_double_accent: {
    '1': ['Rl', 'Lr'],
    '0': ['rL', 'lR', 'rl', 'lr'],
  },
  // invert_paradiddle_kick: {
  //   '1': ['Rl', 'Lr'],
  //   '0': ['rk', 'lk', 'rl', 'lr'],
  // },
  // hadnd_to_hand: {
  //   '1': ['Rlr', 'Lrl'],
  //   '0': ['rlr', 'lrl'],
  // },
}
