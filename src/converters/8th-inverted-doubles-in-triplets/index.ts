import { replaces } from './replaces.ts'
import { createConverter } from '../shared/config-converter.ts'

const config = createConverter({
  converterName: '8th inverted doubles in triplets',
  pattern: replaces['10'][0],
  replaces,
  mode: 'pairs',
  selectConfig: { type: 'best' },
})

export const { converterName, pattern, convert } = config
export { replaces }
export { generateNotation } from './generateNotation.ts'
