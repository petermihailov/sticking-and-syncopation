import { replaces } from './replaces'
import { createConverter } from '../shared/config-converter'

const config = createConverter({
  converterName: '8th inverted doubles in triplets',
  pattern: replaces['10'][0],
  replaces,
  mode: 'pairs',
  selectConfig: { type: 'best' },
})

export const { converterName, pattern, convert } = config
export { replaces }
