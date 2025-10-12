import classes from './KickCheckbox.module.css'

interface KickCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function KickCheckbox({
  checked,
  onChange,
  label = '+ Kick',
}: KickCheckboxProps) {
  return (
    <div className={classes.container}>
      <label className={classes.label}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className={classes.checkbox}
        />
        {label}
      </label>
    </div>
  )
}
