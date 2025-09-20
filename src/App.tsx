import { useState } from 'react'
import classes from './App.module.css'

function App() {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(8).fill(false))

  const handleToggle = (index: number) => {
    setCheckedItems(prev =>
      prev.map((item, i) => i === index ? !item : item)
    )
  }

  return (
    <div className={classes.list}>
      {checkedItems.map((isChecked, index) => (
        <input
          key={index}
          type="checkbox"
          checked={isChecked}
          onChange={() => handleToggle(index)}
        />
      ))}
    </div>
  )
}

export default App
