import { useMemo } from 'react'
import type { Accent, ConvertResult, Meter } from '../types'
import type { NotationData } from '../types/notation'
import {
  converters,
  generateNotation,
  getRudimentMeter,
  type RudimentType,
} from '../converters/registry'
import { buildAccentNotation } from '../lib/notation/builders'

interface RudimentNotation {
  convertResult: ConvertResult
  seeNotation: NotationData
  playNotation: NotationData
  meter: Meter
}

export function useRudimentNotation(
  rudiment: RudimentType,
  accents: boolean[]
): RudimentNotation {
  const convertResult = useMemo<ConvertResult>(() => {
    const accentArray: Accent[] = accents.map(checked => (checked ? 1 : 0))
    const result = converters[rudiment].convert(accentArray)
    return {
      bars: result.bar2 ? [result.bar1, result.bar2] : [result.bar1],
    }
  }, [accents, rudiment])

  const seeNotation = useMemo(() => buildAccentNotation(accents), [accents])

  const playNotation = useMemo(
    () => generateNotation(rudiment, convertResult),
    [rudiment, convertResult]
  )

  const meter = useMemo(() => getRudimentMeter(rudiment), [rudiment])

  return { convertResult, seeNotation, playNotation, meter }
}
