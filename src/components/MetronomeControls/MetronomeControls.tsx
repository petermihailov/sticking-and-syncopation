import { CLICK_SOUNDS, type ClickSound } from '../../types/appState'
import classes from './MetronomeControls.module.css'

interface MetronomeControlsProps {
  enabled: boolean
  sound: ClickSound
  onToggle: () => void
  onSoundChange: (sound: ClickSound) => void
}

export function MetronomeControls({
  enabled,
  sound,
  onToggle,
  onSoundChange,
}: MetronomeControlsProps) {
  return (
    <div className={classes.container}>
      <div className={classes.headerRow}>
        <label className={classes.toggleLabel}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className={classes.toggleInput}
          />
          <span className={classes.toggleSwitch} />
          Metronome
        </label>

        <select
          value={sound}
          onChange={e => onSoundChange(e.target.value as ClickSound)}
          className={classes.soundSelect}
        >
          {CLICK_SOUNDS.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
