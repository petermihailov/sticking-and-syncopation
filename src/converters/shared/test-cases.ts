/**
 * Standard test cases used across all converter tests
 */

export interface TestInput {
  name: string
  input: number[]
}

/**
 * 10 standard test input patterns used to test all converters
 */
export const standardTestInputs: TestInput[] = [
  {
    name: 'Все нули',
    input: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'Все единицы',
    input: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    name: 'Чередование с 1',
    input: [1, 0, 1, 0, 1, 0, 1, 0],
  },
  {
    name: 'Чередование с 0',
    input: [0, 1, 0, 1, 0, 1, 0, 1],
  },
  {
    name: 'Парные единицы',
    input: [1, 1, 0, 0, 1, 1, 0, 0],
  },
  {
    name: 'Парные нули',
    input: [0, 0, 1, 1, 0, 0, 1, 1],
  },
  {
    name: 'Паттерн [1,0,0,0,0,0,0,0]',
    input: [1, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'Паттерн [1,0,0,0,1,0,1,0]',
    input: [1, 0, 0, 0, 1, 0, 1, 0],
  },
  {
    name: 'Паттерн [1,0,0,1,1,0,0,1]',
    input: [1, 0, 0, 1, 1, 0, 0, 1],
  },
  {
    name: 'Паттерн [0,1,0,0,0,0,0,0]',
    input: [0, 1, 0, 0, 0, 0, 0, 0],
  },
]
