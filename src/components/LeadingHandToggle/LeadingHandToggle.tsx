import type { LeadingHand } from '../../types/appState'
import classes from './LeadingHandToggle.module.css'

interface LeadingHandToggleProps {
  value: LeadingHand
  onChange: (hand: LeadingHand) => void
}

export function LeadingHandToggle({ value, onChange }: LeadingHandToggleProps) {
  const toggle = () => onChange(value === 'R' ? 'L' : 'R')

  return (
    <button
      className={classes.toggle}
      onClick={toggle}
      title={value === 'R' ? 'Ведущая: правая' : 'Ведущая: левая'}
      aria-label={`Ведущая рука: ${value === 'R' ? 'правая' : 'левая'}`}
    >
      <span className={value === 'L' ? classes.active : undefined}>L</span>
      <span className={value === 'R' ? classes.active : undefined}>R</span>
    </button>
  )
}
