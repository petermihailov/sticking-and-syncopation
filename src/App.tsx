import { useState, useEffect, useCallback } from 'react'
import { Lessons } from './components/Lessons'
import { findActiveLesson } from './components/Lessons/lessonData'
import { RudimentSelector } from './components/RudimentSelector'
import { AccentPattern } from './components/AccentPattern'
import { VexFlowNotation } from './components/VexFlowNotation'
import { StickingsContainer } from './components/Stickings'
import { AudioPlayer } from './components/AudioPlayer'
import { OrchestrationSection } from './components/OrchestrationSection'
import { LeadingHandToggle } from './components/LeadingHandToggle'
import { AppLayout } from './components/Layout/AppLayout'
import { AppStateProvider } from './context/AppStateContext'
import { PlayerControlProvider } from './context/PlayerControlContext'
import { NotationProvider } from './context/NotationContext'
import { useAppState } from './context/useAppState'
import { usePlayerControl } from './context/usePlayerControl'
import { useNotation } from './context/useNotation'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import {
  DEFAULT_STICKING_MAPPING,
  type StickingMapping,
} from './types/sticking'
import { LocalStorageManager } from './utils/localStorage'
import classes from './App.module.css'

interface LayerVisibility {
  accents: boolean
  seeNotation: boolean
  playNotation: boolean
  stickings: boolean
  strokes: boolean
}

const LAYER_LABELS: Record<keyof LayerVisibility, string> = {
  accents: 'Accents',
  seeNotation: 'Notation',
  playNotation: 'Playback notation',
  stickings: 'Stickings',
  strokes: 'Strokes',
}

const LAYERS_STORAGE_KEY = 'layerVisibility'

const DEFAULT_LAYERS: LayerVisibility = {
  accents: false,
  seeNotation: true,
  playNotation: true,
  stickings: false,
  strokes: false,
}

function loadLayers(): LayerVisibility {
  const saved =
    LocalStorageManager.getItem<Partial<LayerVisibility>>(LAYERS_STORAGE_KEY)
  return saved ? { ...DEFAULT_LAYERS, ...saved } : DEFAULT_LAYERS
}

function AppContent() {
  const { state, actions } = useAppState()
  const { currentBeat, instrumentCounters, isPlaying } = usePlayerControl()

  const [layers, setLayers] = useState<LayerVisibility>(loadLayers)

  useEffect(() => {
    LocalStorageManager.setItem(LAYERS_STORAGE_KEY, layers)
  }, [layers])

  const toggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const { convertResult, seeNotation, playNotation, meter } = useNotation()

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
      <div className={classes.topRow}>
        <RudimentSelector
          selectedRudiment={state.rudiment}
          onRudimentChange={actions.setRudiment}
          leadingHand={state.leadingHand}
        />
        <LeadingHandToggle
          value={state.leadingHand}
          onChange={actions.setLeadingHand}
        />
      </div>
      <AudioPlayer />
      <div className={classes.layerToggles}>
        {(Object.keys(LAYER_LABELS) as (keyof LayerVisibility)[]).map(key => (
          <label key={key} className={classes.layerToggle}>
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => toggleLayer(key)}
            />
            {LAYER_LABELS[key]}
          </label>
        ))}
      </div>
      <div className={classes.notesContainer}>
        {(() => {
          const activeLesson = findActiveLesson(state.accents)
          return activeLesson ? (
            <div className={classes.lessonHeader}>
              <span className={classes.lessonHeaderTitle}>
                {activeLesson.lessonTitle}
              </span>
              <span className={classes.lessonHeaderNumber}>
                {activeLesson.exerciseNumber.toString().padStart(2, '0')}
              </span>
            </div>
          ) : null
        })()}
        {layers.accents && (
          <AccentPattern
            className={classes.checkboxes}
            checkedItems={state.accents}
            onToggle={actions.toggleAccent}
          />
        )}
        <VexFlowNotation
          seeNotation={seeNotation}
          playNotation={playNotation}
          currentRhythmIndex={currentBeat.rhythmIndex}
          isPlaying={isPlaying}
          notesPerBeat={meter.notesPerBeat}
          showSeeNotation={layers.seeNotation}
          showPlayNotation={layers.playNotation}
          matchWidth
        >
          {hasStickings && (layers.stickings || layers.strokes) && (
            <StickingsContainer
              bars={convertResult.bars}
              flams={convertResult.flams}
              currentBeat={isPlaying ? currentBeat : undefined}
              showStickings={layers.stickings}
              showStrokes={layers.strokes}
            />
          )}
        </VexFlowNotation>
      </div>
      <OrchestrationSection
        mapping={state.instrumentMapping}
        instrumentCounters={instrumentCounters}
        onChange={handleMappingChange}
        onReset={handleOrchestrationReset}
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
