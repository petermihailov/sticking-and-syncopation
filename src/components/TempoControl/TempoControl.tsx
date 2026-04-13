import { TEMPO } from '../../config/constants'
import classes from './TempoControl.module.css'

interface TempoControlProps {
  tempo: number
  onChange: (tempo: number) => void
}

export function TempoControl({ tempo, onChange }: TempoControlProps) {
  return (
    <div className={classes.container}>
      <label htmlFor="tempo-slider" className={classes.label}>
        Tempo: {tempo} BPM
      </label>
      <input
        id="tempo-slider"
        type="range"
        min={TEMPO.MIN}
        max={TEMPO.MAX}
        value={tempo}
        onChange={e => onChange(Number(e.target.value))}
        className={classes.slider}
      />
    </div>
  )
}
