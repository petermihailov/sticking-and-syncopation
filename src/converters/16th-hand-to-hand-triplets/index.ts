import { replaces } from './replaces'
import { createConverter } from '../shared/config-converter'

const config = createConverter({
  converterName: '16th hand-to-hand triplets',
  pattern: replaces['10'][0],
  replaces,
  mode: 'pairs',
  selectConfig: {
    type: 'byLastPattern',
    mapping: {
      'R ': 1,
      'L ': 0,
    },
  },
})

export const { converterName, pattern, convert } = config
export { replaces }
