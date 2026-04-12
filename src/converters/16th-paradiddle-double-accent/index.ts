import { replaces } from './replaces'
import { createConverter } from '../shared/config-converter'

const config = createConverter({
  converterName: '16th paradiddle double accent',
  pattern: replaces['1'][0] + replaces['0'][0],
  replaces,
  mode: 'accents',
  filterConfig: {
    type: 'caseAware',
    rules: [{ when: 'both', prefer: 'someLowercase' }],
  },
})

export const { converterName, pattern, convert } = config
export { replaces }
