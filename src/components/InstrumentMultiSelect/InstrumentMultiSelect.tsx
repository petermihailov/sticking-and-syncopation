import type { Instrument } from '../../types/instrument'
import { INSTRUMENT_GROUPS } from '../../types/instrument'
import classes from './InstrumentMultiSelect.module.css'

interface InstrumentMultiSelectProps {
  values: Instrument[]
  onChange: (values: Instrument[]) => void
  counterKey: string
  instrumentCounters: Map<string, number>
}

export function InstrumentMultiSelect({
  values,
  onChange,
  counterKey,
  instrumentCounters,
}: InstrumentMultiSelectProps) {
  const handleAdd = (instrument: Instrument) => {
    onChange([...values, instrument])
  }

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  // Get current counter value for rotation visualization
  const counter = instrumentCounters.get(counterKey) || 0
  const currentIndex = values.length > 0 ? counter % values.length : -1
  const nextIndex = values.length > 0 ? (counter + 1) % values.length : -1

  // Helper to get chip style based on position in rotation
  const getChipClass = (index: number) => {
    const isCurrent = index === currentIndex
    const isNext = index === nextIndex && values.length > 1

    if (isCurrent) {
      return classes.chipCurrent
    } else if (isNext) {
      return classes.chipNext
    } else {
      return classes.chip
    }
  }

  return (
    <div className={classes.container}>
      {/* Selected instruments */}
      {values.length > 0 && (
        <div className={classes.chipList}>
          {values.map((inst, index) => {
            const isCurrent = index === currentIndex
            const isNext = index === nextIndex && values.length > 1

            return (
              <div key={`${inst}-${index}`} className={getChipClass(index)}>
                <span className={classes.chipText}>
                  {inst.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </span>
                <button
                  onClick={() => handleRemove(index)}
                  className={classes.removeButton}
                  title="Remove"
                  type="button"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Dropdown to add instruments */}
      <select
        value=""
        onChange={e => {
          if (e.target.value) {
            handleAdd(e.target.value as Instrument)
            e.target.value = '' // Reset dropdown
          }
        }}
        className={classes.dropdown}
      >
        <option value="">+ Add instrument</option>
        {Object.entries(INSTRUMENT_GROUPS).map(([groupName, instruments]) => (
          <optgroup key={groupName} label={groupName}>
            {instruments.map(inst => (
              <option key={inst} value={inst}>
                {inst.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
