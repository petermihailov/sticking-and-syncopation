import { useMemo } from 'react'
import type { Accent, ConvertResult, Meter } from '../types'
import type { NotationData } from '../types/notation'
import type { LeadingHand } from '../types/appState'
import {
  converters,
  generateNotation,
  getRudimentMeter,
  type RudimentType,
} from '../converters/registry'
import { buildAccentNotation } from '../lib/notation/builders'
import { mirrorStickings } from '../utils/mirrorSticking'

interface RudimentNotation {
  convertResult: ConvertResult
  seeNotation: NotationData
  playNotation: NotationData
  meter: Meter
}

export function useRudimentNotation(
  rudiment: RudimentType,
  accents: boolean[],
  leadingHand: LeadingHand = 'R'
): RudimentNotation {
  const convertResult = useMemo<ConvertResult>(() => {
    const accentArray = accents.map((checked): Accent => (checked ? 1 : 0))
    const { bar1, bar2, flams1, flams2 } =
      converters[rudiment].convert(accentArray)
    const mirror = leadingHand === 'L'
    const result: ConvertResult = {
      bars: bar2
        ? [
            mirror ? mirrorStickings(bar1) : bar1,
            mirror ? mirrorStickings(bar2) : bar2,
          ]
        : [mirror ? mirrorStickings(bar1) : bar1],
    }
    if (flams1) {
      result.flams = flams2 ? [flams1, flams2] : [flams1]
    }
    return result
  }, [accents, rudiment, leadingHand])

  const seeNotation = useMemo(() => buildAccentNotation(accents), [accents])

  const playNotation = useMemo(
    () => generateNotation(rudiment, convertResult),
    [rudiment, convertResult]
  )

  const meter = useMemo(() => getRudimentMeter(rudiment), [rudiment])

  return { convertResult, seeNotation, playNotation, meter }
}
