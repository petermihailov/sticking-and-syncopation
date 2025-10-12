import { useState } from 'react'
import type { Instrument, StickingMapping } from '../../types/instrument'
import { InstrumentGroup } from '../InstrumentGroup/InstrumentGroup'
import classes from './OrchestrationPanel.module.css'

interface OrchestrationPanelProps {
  mapping: StickingMapping
  onChange: (key: keyof StickingMapping, value: Instrument[] | boolean) => void
  instrumentCounters: Map<string, number>
}

export function OrchestrationPanel({
  mapping,
  onChange,
  instrumentCounters,
}: OrchestrationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={classes.container}>
      <div className={classes.header} onClick={() => setIsOpen(!isOpen)}>
        <span className={classes.icon}>{isOpen ? '▼' : '▶'}</span>
        <span>Orchestration</span>
      </div>

      {isOpen && (
        <div className={classes.grid}>
          {/* L (left hand accent) */}
          <InstrumentGroup
            label="L"
            description="accent"
            instruments={mapping.uppercaseL}
            hasKick
            kickEnabled={mapping.uppercaseLKick}
            counterKey="uppercaseL"
            instrumentCounters={instrumentCounters}
            onInstrumentsChange={v => onChange('uppercaseL', v)}
            onKickChange={v => onChange('uppercaseLKick', v)}
          />

          {/* R (right hand accent) */}
          <InstrumentGroup
            label="R"
            description="accent"
            instruments={mapping.uppercaseR}
            hasKick
            kickEnabled={mapping.uppercaseRKick}
            counterKey="uppercaseR"
            instrumentCounters={instrumentCounters}
            onInstrumentsChange={v => onChange('uppercaseR', v)}
            onKickChange={v => onChange('uppercaseRKick', v)}
          />

          {/* l (left hand ghost) */}
          <InstrumentGroup
            label="l"
            description="ghost"
            instruments={mapping.lowercaseL}
            counterKey="lowercaseL"
            instrumentCounters={instrumentCounters}
            onInstrumentsChange={v => onChange('lowercaseL', v)}
          />

          {/* r (right hand ghost) */}
          <InstrumentGroup
            label="r"
            description="ghost"
            instruments={mapping.lowercaseR}
            counterKey="lowercaseR"
            instrumentCounters={instrumentCounters}
            onInstrumentsChange={v => onChange('lowercaseR', v)}
          />

          {/* k (kick) */}
          <InstrumentGroup
            label="k"
            description="kick"
            instruments={mapping.kick}
            counterKey="kick"
            instrumentCounters={instrumentCounters}
            onInstrumentsChange={v => onChange('kick', v)}
            fullWidth
          />
        </div>
      )}
    </div>
  )
}
