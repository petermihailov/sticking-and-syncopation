import type { RudimentType } from '../types.ts'

import * as paradiddleSingle from './16th-paradiddle-single-accent/index.ts'
import * as paradiddleDouble from './16th-paradiddle-double-accent/index.ts'
import * as invertParadiddleSingle from './16th-inverted-paradiddle-single-accent/index.ts'
import * as invertParadiddleDouble from './16th-inverted-paradiddle-double-accent/index.ts'
import * as invertParadiddleKick from './16th-inverted-paradiddle-kick/index.ts'
import * as handToHandTriplet8 from './8th-hand-to-hand-triplets/index.ts'
import * as handToHandTriplet16 from './16th-hand-to-hand-triplets/index.ts'

export const converters = {
  '16th-paradiddle-single-accent': paradiddleSingle,
  '16th-paradiddle-double-accent': paradiddleDouble,
  '16th-invert-paradiddle-single-accent': invertParadiddleSingle,
  '16th-invert-paradiddle-double-accent': invertParadiddleDouble,
  '16th-invert-paradiddle-kick': invertParadiddleKick,
  // triplets
  '8th-hand-to-hand-triplets': handToHandTriplet8,
  '16th-hand-to-hand-triplets': handToHandTriplet16,
} as const

export function getRudimentOptions() {
  return Object.entries(converters).map(([value, converter]) => ({
    value: value as RudimentType,
    label: converter.converterName,
    pattern: converter.pattern,
  }))
}
