import type { RudimentType } from '../../types'
import classes from './RudimentSelector.module.css'

interface RudimentSelectorProps {
  selectedRudiment: RudimentType
  onRudimentChange: (rudiment: RudimentType) => void
}

export function RudimentSelector({
  selectedRudiment,
  onRudimentChange,
}: RudimentSelectorProps) {
  return (
    <div className={classes.patternSelect}>
      <select
        value={selectedRudiment}
        onChange={e => onRudimentChange(e.target.value as RudimentType)}
      >
        <option value="paradiddle_single_accent">
          Paradiddle Single Accent
        </option>
        <option value="paradiddle_double_accent">
          Paradiddle Double Accent
        </option>
        <option value="invert_paradiddle_single_accent">
          Invert paradiddle Single Accent
        </option>
        <option value="invert_paradiddle_double_accent">
          Invert paradiddle Double Accent
        </option>
        {/*<option value="invert_paradiddle_kick">Invert paradiddle Kick</option>*/}
      </select>
    </div>
  )
}
