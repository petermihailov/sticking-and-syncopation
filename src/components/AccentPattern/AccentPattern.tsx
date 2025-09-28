import clsx from 'clsx'
import classes from './AccentPattern.module.css'

interface AccentPatternProps {
  checkedItems: boolean[]
  onToggle: (index: number) => void
}

export function AccentPattern({ checkedItems, onToggle }: AccentPatternProps) {
  return (
    <>
      <div className={classes.checkboxLabels}>
        {['1', '&', '2', '&', '3', '&', '4', '&'].map((label, index) => (
          <div key={index} className={classes.checkboxLabel}>
            {label}
          </div>
        ))}
      </div>
      <div className={clsx(classes.eighth)}>
        {checkedItems.map((isChecked, index) => (
          <input
            key={index}
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle(index)}
          />
        ))}
      </div>
    </>
  )
}