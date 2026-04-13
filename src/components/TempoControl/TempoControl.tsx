import { useEffect, useRef, useState } from 'react'
import { TEMPO } from '../../config/constants'
import classes from './TempoControl.module.css'

const DEBOUNCE_MS = 150

interface TempoControlProps {
  tempo: number
  onChange: (tempo: number) => void
}

export function TempoControl({ tempo, onChange }: TempoControlProps) {
  const [localTempo, setLocalTempo] = useState(tempo)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Синхронизация с внешним значением (например, при загрузке из URL)
  useEffect(() => {
    setLocalTempo(tempo)
  }, [tempo])

  const handleChange = (value: number) => {
    setLocalTempo(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(value), DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className={classes.container}>
      <label htmlFor="tempo-slider" className={classes.label}>
        <span className={classes.bpm}>{localTempo}</span> bpm
      </label>
      <input
        id="tempo-slider"
        type="range"
        min={TEMPO.MIN}
        max={TEMPO.MAX}
        value={localTempo}
        onChange={e => handleChange(Number(e.target.value))}
        className={`${classes.slider} customSlider`}
      />
    </div>
  )
}
