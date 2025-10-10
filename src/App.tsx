import { useEffect, useMemo } from 'react'
import type { Accent } from './types.ts'
import { convertToParadiddles } from './converters/paradiddles'
import { convertHandToHand } from './converters/triplets/hand-to-hand'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { ABCNotation } from './components/ABCNotation'
import {
  generateAccentNotation,
  generateParadiddleNotation,
} from './notationGenerators'
import { generateHandToHandNotation } from './notationGenerators/handToHandNotationGenerator'
import { AppStateProvider, useAppState } from './context/AppStateContext'

function AppContent() {
  const { state, actions } = useAppState()

  // Convert accents to rudiment pattern
  const convertResult = useMemo(() => {
    const accentArray: Accent[] = state.accents.map(checked => (checked ? 1 : 0))

    if (state.rudiment === 'hand_to_hand_triplets') {
      const stickings = convertHandToHand(accentArray)
      return { stickings }
    } else {
      return convertToParadiddles(accentArray, state.rudiment)
    }
  }, [state.accents, state.rudiment])

  // Keyboard shortcut: R for reset to defaults
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        event.preventDefault()
        actions.resetToDefaults()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions])

  return (
    <>
      <RudimentSelector
        selectedRudiment={state.rudiment}
        onRudimentChange={actions.setRudiment}
      />
      <ABCNotation
        seeNotation={generateAccentNotation(state.accents)}
        playNotation={
          state.rudiment === 'hand_to_hand_triplets'
            ? generateHandToHandNotation(convertResult as { stickings: any[] })
            : generateParadiddleNotation(convertResult as any)
        }
        bars={
          state.rudiment === 'hand_to_hand_triplets'
            ? [(convertResult as { stickings: any[] }).stickings?.join('') || '']
            : (convertResult as any).bars || []
        }
      />
      <AccentPattern checkedItems={state.accents} onToggle={actions.toggleAccent} />
    </>
  )
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  )
}

export default App
