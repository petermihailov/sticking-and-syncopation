import * as paradiddleSingle from './16th-paradiddle-single-accent/index.ts'
import * as paradiddleDouble from './16th-paradiddle-double-accent/index.ts'
import * as invertParadiddleSingle from './16th-inverted-paradiddle-single-accent/index.ts'
import * as invertParadiddleDouble from './16th-inverted-paradiddle-double-accent/index.ts'
import * as invertParadiddleKick from './16th-inverted-paradiddle-kick/index.ts'
import * as invertParadiddleKickRightAccent from './16th-inverted-paradiddle-kick-right-accent/index.ts'
import * as handToHandTriplet8 from './8th-hand-to-hand-triplets/index.ts'
import * as handToHandTriplet16 from './16th-hand-to-hand-triplets/index.ts'
import * as invertedDoublesInTriplets8 from './8th-inverted-doubles-in-triplets/index.ts'

export const converters = {
  '16th-paradiddle-single-accent': paradiddleSingle,
  '16th-paradiddle-double-accent': paradiddleDouble,
  '16th-invert-paradiddle-single-accent': invertParadiddleSingle,
  '16th-invert-paradiddle-double-accent': invertParadiddleDouble,
  '16th-invert-paradiddle-kick': invertParadiddleKick,
  '16th-invert-paradiddle-kick-right-accent': invertParadiddleKickRightAccent,
  // triplets
  '8th-hand-to-hand-triplets': handToHandTriplet8,
  '8th-inverted-doubles-in-triplets': invertedDoublesInTriplets8,
  '16th-hand-to-hand-triplets': handToHandTriplet16,
} as const

export type RudimentType = keyof typeof converters

export interface RudimentOption {
  value: RudimentType
  label: string
  pattern: string
}

export interface RudimentGroup {
  groupName: string
  options: RudimentOption[]
}

export function getRudimentGroups(): RudimentGroup[] {
  return [
    {
      groupName: '16th Notes',
      options: [
        {
          value: '16th-paradiddle-single-accent',
          label: paradiddleSingle.converterName,
          pattern: paradiddleSingle.pattern,
        },
        {
          value: '16th-paradiddle-double-accent',
          label: paradiddleDouble.converterName,
          pattern: paradiddleDouble.pattern,
        },
        {
          value: '16th-invert-paradiddle-single-accent',
          label: invertParadiddleSingle.converterName,
          pattern: invertParadiddleSingle.pattern,
        },
        {
          value: '16th-invert-paradiddle-double-accent',
          label: invertParadiddleDouble.converterName,
          pattern: invertParadiddleDouble.pattern,
        },
        {
          value: '16th-invert-paradiddle-kick',
          label: invertParadiddleKick.converterName,
          pattern: invertParadiddleKick.pattern,
        },
        {
          value: '16th-invert-paradiddle-kick-right-accent',
          label: invertParadiddleKickRightAccent.converterName,
          pattern: invertParadiddleKickRightAccent.pattern,
        },
      ],
    },
    {
      groupName: 'Triplets',
      options: [
        {
          value: '8th-hand-to-hand-triplets',
          label: handToHandTriplet8.converterName,
          pattern: handToHandTriplet8.pattern,
        },
        {
          value: '8th-inverted-doubles-in-triplets',
          label: invertedDoublesInTriplets8.converterName,
          pattern: invertedDoublesInTriplets8.pattern,
        },
        {
          value: '16th-hand-to-hand-triplets',
          label: handToHandTriplet16.converterName,
          pattern: handToHandTriplet16.pattern,
        },
      ],
    },
  ]
}

export function getRudimentOptions(): RudimentOption[] {
  return getRudimentGroups().flatMap(group => group.options)
}
