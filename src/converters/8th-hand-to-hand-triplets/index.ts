import { replaces } from './replaces'
import { createConverter } from '../shared/config-converter'

const config = createConverter({
  converterName: '8th hand-to-hand triplets',
  pattern: replaces['10'][0],
  replaces,
  mode: 'pairs',
  selectConfig: {
    type: 'byLastPattern',
    mapping: {
      rl: 0,
      Rl: 0,
      rL: 0,
      RL: 0,
      lr: 1,
      Lr: 1,
      lR: 1,
      LR: 1,
    },
  },
})

export const { converterName, pattern, convert } = config
export { replaces }
