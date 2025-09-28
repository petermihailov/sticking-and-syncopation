import { useState } from 'react'
import type { Accent, RudimentType } from './types.ts'
import { convertToParadiddles } from './converters/paradiddles'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { StickingDisplay } from './components/StickingDisplay'

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
      <RudimentSelector
        selectedRudiment={selectedRudiment}
        onRudimentChange={handleRudimentChange}
      />
      <AccentPattern
        checkedItems={checkedItems}
        onToggle={handleToggle}
      />
      <StickingDisplay bars={convertResult.bars} />
    </>
  )
}

export default App
