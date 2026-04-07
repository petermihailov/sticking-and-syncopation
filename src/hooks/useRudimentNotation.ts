import { useMemo } from 'react'
import type { Accent, ConvertResult } from '../types'
import type { NotationData } from '../types/notation'
import { converters, generateNotation, type RudimentType } from '../converters/registry'
import { buildAccentNotation } from '../notationGenerators/builders'

interface RudimentNotation {
  convertResult: ConvertResult
  seeNotation: NotationData
  playNotation: NotationData
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

  return { convertResult, seeNotation, playNotation }
}
