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
    '1': ['Rl', 'Lr', 'RL', 'LR'],
    '0': ['rL', 'lR', 'rl', 'lr'],
  },
}

/*
  Начинается с правой руки.

  ### Выбор варианта из массива
  Для accent=1: всегда выбирается оптимальный вариант из массива
  Для accent=0: выбирается вариант по циклическому паттерну из доступных в массиве
  При наличии нескольких вариантов учитываются ограничения на переходы

  ### Определение зеркальной фигуры:
  Если такт заканчивается на r, а начинается с R;
  Если такт заканчивается на R, а начинается с r;
  Если такт заканчивается на L, а начинается с l;
  Если такт заканчивается на l, а начинается с L;
  то фигура зеркальная и нужно рисовать второй такт

  #### Ограничения
  Не может быть rrr lll трёх ударов одной рукой, с любой вариацией акцентов
  Не может быть Rr / Rr / Ll / lL - два разных типа удара одной рукой
*/
