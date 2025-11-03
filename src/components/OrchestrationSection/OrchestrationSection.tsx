import type { StickingMapping } from '../../types/instrument'
import { OrchestrationPanel } from '../OrchestrationPanel/OrchestrationPanel'
import classes from './OrchestrationSection.module.css'

interface OrchestrationSectionProps {
  mapping: StickingMapping
  instrumentCounters: Map<string, number>
  onChange: (key: keyof StickingMapping, value: unknown) => void
  onReset: () => void
}

export function OrchestrationSection({
  mapping,
  instrumentCounters,
  onChange,
  onReset,
}: OrchestrationSectionProps) {
  return (
    <div className={classes.container}>
      <OrchestrationPanel
        mapping={mapping}
        onChange={onChange}
        instrumentCounters={instrumentCounters}
        onReset={onReset}
      />
    </div>
  )
}
