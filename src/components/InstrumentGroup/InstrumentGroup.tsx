import type { Instrument } from '../../types/instrument'
import { InstrumentMultiSelect } from '../InstrumentMultiSelect/InstrumentMultiSelect'
import { KickCheckbox } from '../KickCheckbox/KickCheckbox'
import classes from './InstrumentGroup.module.css'

interface InstrumentGroupProps {
  label: string
  description: string // "accent" | "ghost" | "kick"
  instruments: Instrument[]
  hasKick?: boolean
  kickEnabled?: boolean
  counterKey: string
  instrumentCounters: Map<string, number>
  onInstrumentsChange: (instruments: Instrument[]) => void
  onKickChange?: (enabled: boolean) => void
  fullWidth?: boolean
}

export function InstrumentGroup({
  label,
  description,
  instruments,
  hasKick = false,
  kickEnabled = false,
  counterKey,
  instrumentCounters,
  onInstrumentsChange,
  onKickChange,
  fullWidth = false,
}: InstrumentGroupProps) {
  return (
    <div className={`${classes.container} ${fullWidth ? classes.fullWidth : ''}`}>
      <div className={classes.header}>
        <span className={classes.label}>{label}</span>
        <span className={classes.description}>({description})</span>
      </div>

      <InstrumentMultiSelect
        values={instruments}
        onChange={onInstrumentsChange}
        counterKey={counterKey}
        instrumentCounters={instrumentCounters}
      />

      {hasKick && onKickChange && (
        <KickCheckbox checked={kickEnabled} onChange={onKickChange} />
      )}
    </div>
  )
}
