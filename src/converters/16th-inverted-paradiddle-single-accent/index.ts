import { replaces } from './replaces.ts'
import { createConverter } from '../shared/config-converter.ts'

const config = createConverter({
  converterName: '16th inverted paradiddle single accent',
  pattern: replaces['1'][0] + replaces['0'][1],
  replaces,
  mode: 'accents',
  filterConfig: {
    type: 'caseAware',
    rules: [
      { when: 'nextIsAccent', prefer: 'someUppercase' },
    ],
  },
})

export const { converterName, pattern, convert } = config
export { replaces }
