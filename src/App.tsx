import { Lessons } from './components/Lessons'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { VexFlowNotation } from './components/VexFlowNotation'
import { Stickings } from './components/Stickings'
import { AudioPlayer } from './components/AudioPlayer'
import { OrchestrationSection } from './components/OrchestrationSection'
import { AppLayout } from './components/Layout/AppLayout'
import { AppStateProvider, useAppState } from './context/AppStateContext'
import {
  PlayerControlProvider,
  usePlayerControl,
} from './context/PlayerControlContext'
import { NotationProvider, useNotation } from './context/NotationContext'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import {
  DEFAULT_STICKING_MAPPING,
  type StickingMapping,
} from './types/sticking'

function AppContent() {
  const { state, actions } = useAppState()
  const { currentBeat, instrumentCounters } = usePlayerControl()

  const { convertResult, seeNotation, playNotation } = useNotation()

  useGlobalShortcuts({ onReset: actions.resetToDefaults })

  const handleMappingChange = (key: keyof StickingMapping, value: unknown) => {
    actions.setInstrumentMapping({
      ...state.instrumentMapping,
      [key]: value,
    })
  }

  const handleOrchestrationReset = () => {
    actions.setInstrumentMapping(DEFAULT_STICKING_MAPPING)
  }

  const hasStickings =
    convertResult.bars.length > 0 && convertResult.bars[0].length > 0

  return (
    <AppLayout sidebar={<Lessons />}>
      <RudimentSelector
        selectedRudiment={state.rudiment}
        onRudimentChange={actions.setRudiment}
      />
      <AudioPlayer />
      <VexFlowNotation seeNotation={seeNotation} playNotation={playNotation}>
        {hasStickings && (
          <Stickings bars={convertResult.bars} currentBeat={currentBeat} />
        )}
      </VexFlowNotation>
      <OrchestrationSection
        mapping={state.instrumentMapping}
        instrumentCounters={instrumentCounters}
        onChange={handleMappingChange}
        onReset={handleOrchestrationReset}
      />
      <AccentPattern
        checkedItems={state.accents}
        onToggle={actions.toggleAccent}
      />
    </AppLayout>
  )
}

function App() {
  return (
    <AppStateProvider>
      <NotationProvider>
        <PlayerControlProvider>
          <AppContent />
        </PlayerControlProvider>
      </NotationProvider>
    </AppStateProvider>
  )
}

export default App
