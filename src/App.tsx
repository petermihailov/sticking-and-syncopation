import { useState } from 'react'
import classes from './App.module.css'
import clsx from 'clsx'
import type { Accent, RudimentType, Sticking } from './types.ts'
import { convertToParadiddles } from './converters/paradiddles'

function App() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(8).fill(false)
  )
  const [selectedRudiment, setSelectedRudiment] = useState<RudimentType>(
    'paradiddle_single_accent'
  )
  const [convertResult, setConvertResult] = useState(() =>
    convertToParadiddles(new Array(8).fill(0), 'paradiddle_single_accent')
  )

  const convertWithRudiment = (accents: Accent[]) => {
    const result = convertToParadiddles(accents, selectedRudiment)
    setConvertResult(result)
  }

  // Получаем массивы символов для каждого такта
  const firstBarLabels: Sticking[] = convertResult.bars[0]
    .replace(/\s/g, '')
    .split('') as Sticking[]

  const secondBarLabels: Sticking[] | null = convertResult.bars[1]
    ? (convertResult.bars[1].replace(/\s/g, '').split('') as Sticking[])
    : null

  const handleToggle = (index: number) => {
    setCheckedItems(prev => {
      const newCheckedItems = prev.map((item, i) =>
        i === index ? !item : item
      )
      // Convert boolean array to Accent array
      const accentArray: Accent[] = newCheckedItems.map(checked =>
        checked ? 1 : 0
      )
      convertWithRudiment(accentArray)
      return newCheckedItems
    })
  }

  const handleRudimentChange = (rudiment: RudimentType) => {
    setSelectedRudiment(rudiment)
    // Regenerate pattern with new rudiment
    const accentArray: Accent[] = checkedItems.map(checked => (checked ? 1 : 0))
    const result = convertToParadiddles(accentArray, rudiment)
    setConvertResult(result)
  }

  return (
    <>
      <div className={classes.patternSelect}>
        <select
          value={selectedRudiment}
          onChange={e => handleRudimentChange(e.target.value as RudimentType)}
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
        </select>
      </div>
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
            onChange={() => handleToggle(index)}
          />
        ))}
      </div>
      <div className={classes.labels}>
        {firstBarLabels.map((label, index) => (
          <div
            className={clsx(classes.label, {
              [classes.r]: label.toLowerCase() === 'r',
              [classes.l]: label.toLowerCase() === 'l',
              [classes.a]: label === 'R' || label === 'L',
            })}
            key={index}
          >
            {label}
          </div>
        ))}
      </div>
      {secondBarLabels && (
        <div className={clsx(classes.labels, classes.secondBar)}>
          {secondBarLabels.map((label, index) => (
            <div
              className={clsx(classes.label, {
                [classes.r]: label.toLowerCase() === 'r',
                [classes.l]: label.toLowerCase() === 'l',
                [classes.a]: label === 'R' || label === 'L',
              })}
              key={index}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default App
