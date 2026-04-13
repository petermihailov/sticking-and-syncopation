import type { ConvertResult, Meter } from '../types'
import type { NotationData } from '../types/notation'
import {
  buildSixteenthNotation,
  buildTripletNotation,
  buildSixteenthTripletNotation,
} from '../lib/notation/builders'
import type { Sticking } from '../types'
import * as paradiddleSingle from './16th-paradiddle-single-accent/index'
import * as paradiddleDouble from './16th-paradiddle-double-accent/index'
import * as invertParadiddleSingle from './16th-inverted-paradiddle-single-accent/index'
import * as invertParadiddleDouble from './16th-inverted-paradiddle-double-accent/index'
import * as invertParadiddleKick from './16th-inverted-paradiddle-kick/index'
import * as invertParadiddleKickRightAccent from './16th-inverted-paradiddle-kick-right-accent/index'
import * as handToHandTriplet8 from './8th-hand-to-hand-triplets/index'
import * as handToHandTriplet16 from './16th-hand-to-hand-triplets/index'
import * as invertedDoublesInTriplets8 from './8th-inverted-doubles-in-triplets/index'
import * as flamTriplets8 from './8th-flam-triplets/index'

type ConverterModule = {
  converterName: string
  pattern: string
  convert: (
    accentMap8: import('../types').Accent[]
  ) => import('./shared/config-types').ConvertResultBars
}

type NotationKind = 'sixteenth' | 'triplet' | 'sixteenthTriplet'

type RudimentDef = {
  id: string
  group: string
  notationKind: NotationKind
  module: ConverterModule
}

const NOTATION_BUILDERS: Record<
  NotationKind,
  (stickings: Sticking[], flams?: boolean[]) => NotationData
> = {
  sixteenth: buildSixteenthNotation,
  triplet: buildTripletNotation,
  sixteenthTriplet: buildSixteenthTripletNotation,
}

/** Размер для каждого вида нотации. Все рудименты — в 4/4. */
const METER_BY_KIND: Record<NotationKind, Meter> = {
  sixteenth: { beatsPerBar: 4, noteValue: 4, notesPerBeat: 4 },
  triplet: { beatsPerBar: 4, noteValue: 4, notesPerBeat: 3 },
  sixteenthTriplet: { beatsPerBar: 4, noteValue: 4, notesPerBeat: 6 },
}

const RUDIMENTS = [
  {
    id: '16th-paradiddle-single-accent',
    group: '16th Notes',
    notationKind: 'sixteenth',
    module: paradiddleSingle,
  },
  {
    id: '16th-paradiddle-double-accent',
    group: '16th Notes',
    notationKind: 'sixteenth',
    module: paradiddleDouble,
  },
  {
    id: '16th-invert-paradiddle-single-accent',
    group: '16th Notes',
    notationKind: 'sixteenth',
    module: invertParadiddleSingle,
  },
  {
    id: '16th-invert-paradiddle-double-accent',
    group: '16th Notes',
    notationKind: 'sixteenth',
    module: invertParadiddleDouble,
  },
  {
    id: '16th-invert-paradiddle-kick',
    group: '16th Notes',
    notationKind: 'sixteenth',
    module: invertParadiddleKick,
  },
  {
    id: '16th-invert-paradiddle-kick-right-accent',
    group: '16th Notes',
    notationKind: 'sixteenth',
    module: invertParadiddleKickRightAccent,
  },
  {
    id: '8th-hand-to-hand-triplets',
    group: 'Triplets',
    notationKind: 'triplet',
    module: handToHandTriplet8,
  },
  {
    id: '8th-inverted-doubles-in-triplets',
    group: 'Triplets',
    notationKind: 'triplet',
    module: invertedDoublesInTriplets8,
  },
  {
    id: '8th-flam-triplets',
    group: 'Triplets',
    notationKind: 'triplet',
    module: flamTriplets8,
  },
  {
    id: '16th-hand-to-hand-triplets',
    group: 'Triplets',
    notationKind: 'sixteenthTriplet',
    module: handToHandTriplet16,
  },
] as const satisfies readonly RudimentDef[]

export type RudimentType = (typeof RUDIMENTS)[number]['id']

export const converters = Object.fromEntries(
  RUDIMENTS.map(r => [r.id, r.module])
) as unknown as Record<RudimentType, ConverterModule>

const notationKindById = Object.fromEntries(
  RUDIMENTS.map(r => [r.id, r.notationKind])
) as Record<RudimentType, NotationKind>

// Пока рендерим только первый такт — многотактовые рудименты не поддержаны
export function generateNotation(
  type: RudimentType,
  convertResult: ConvertResult
): NotationData {
  return NOTATION_BUILDERS[notationKindById[type]](
    convertResult.bars[0],
    convertResult.flams?.[0]
  )
}

export function getRudimentMeter(type: RudimentType): Meter {
  return METER_BY_KIND[notationKindById[type]]
}

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
  const groups = new Map<string, RudimentOption[]>()
  for (const r of RUDIMENTS) {
    const option: RudimentOption = {
      value: r.id,
      label: r.module.converterName,
      pattern: r.module.pattern,
    }
    const existing = groups.get(r.group)
    if (existing) {
      existing.push(option)
    } else {
      groups.set(r.group, [option])
    }
  }
  return Array.from(groups, ([groupName, options]) => ({ groupName, options }))
}

export function getRudimentOptions(): RudimentOption[] {
  return getRudimentGroups().flatMap(group => group.options)
}
