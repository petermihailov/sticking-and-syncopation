import type { Sticking } from '../../types'
import { StickingBar } from '../StickingBar'

interface StickingDisplayProps {
  bars: string[]
}

export function StickingDisplay({ bars }: StickingDisplayProps) {
  const firstBarLabels: Sticking[] = bars[0]
    .replace(/\s/g, '')
    .split('') as Sticking[]

  const secondBarLabels: Sticking[] | null = bars[1]
    ? (bars[1].replace(/\s/g, '').split('') as Sticking[])
    : null

  return (
    <>
      <StickingBar labels={firstBarLabels} />
      {secondBarLabels && (
        <StickingBar labels={secondBarLabels} isSecondBar />
      )}
    </>
  )
}