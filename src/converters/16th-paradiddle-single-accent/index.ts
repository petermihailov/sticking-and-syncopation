import { replaces } from './replaces.ts'
import { createConverter } from '../shared/config-converter.ts'

const config = createConverter({
  converterName: '16th paradiddle single accent',
  pattern: replaces['1'][0] + replaces['0'][0],
  replaces,
  mode: 'accents',
  filterConfig: { type: 'none' },
})

export const { converterName, pattern, convert } = config
export { replaces }
