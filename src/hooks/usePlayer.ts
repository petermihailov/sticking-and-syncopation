import { useEffect, useState, useCallback } from 'react'
import { createPlayer } from '../lib/player'
import { createDrumKit, resumeAudioContext } from '../utils/audio'
import { stickingsToBars } from '../utils/groove'
import type { DrumKit, StickingMapping } from '../types/instrument'
import type { Sticking } from '../types'
import { usePlayerControl } from '../context/PlayerControlContext'

interface UsePlayerOptions {
  bars: Sticking[][]
  instrumentMapping: StickingMapping
  tempo: number
  metronome: boolean
  metronomeVolume: number
  onBeatChange?: (beat: { barIndex: number; rhythmIndex: number }) => void
}

interface UsePlayerResult {
  isLoading: boolean
  drumKit: DrumKit | null
  instrumentCounters: Map<string, number>
  hasPattern: boolean
  toggle: () => void
}

/**
 * Инкапсулирует жизненный цикл императивного Player и его синхронизацию с React state.
 */
export function usePlayer({
  bars,
  instrumentMapping,
  tempo,
  metronome,
  metronomeVolume,
  onBeatChange,
}: UsePlayerOptions): UsePlayerResult {
  const {
    playerRef,
    isPlaying,
    setIsPlaying,
    setCurrentBeat,
    stop: stopPlayer,
  } = usePlayerControl()

  const [drumKit, setDrumKit] = useState<DrumKit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [instrumentCounters, setInstrumentCounters] = useState<
    Map<string, number>
  >(new Map())

  const hasPattern = bars.length > 0 && bars[0].length > 0

  // Инициализация плеера и загрузка кита (один раз)
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        setIsLoading(true)
        const kit = await createDrumKit(
          '/sticking-and-syncopation/sounds/',
          'wav'
        )
        if (cancelled) return

        setDrumKit(kit)

        const player = createPlayer()
        player.setKit(kit)
        player.setTempo(tempo)
        player.setInstrumentMapping(instrumentMapping)
        if (metronome) player.playMetronome()
        player.setMetronomeVolume(metronomeVolume)

        player.setOnBeat(beat => {
          setCurrentBeat({
            barIndex: beat.barIndex,
            rhythmIndex: beat.rhythmIndex,
          })
          setInstrumentCounters(player.getInstrumentCounters())
          onBeatChange?.({
            barIndex: beat.barIndex,
            rhythmIndex: beat.rhythmIndex,
          })
        })

        playerRef.current = player
        setIsReady(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize player:', error)
        if (!cancelled) setIsLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      if (playerRef.current && isPlaying) {
        playerRef.current.stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Синхронизация bars
  useEffect(() => {
    if (!isReady || !playerRef.current || !hasPattern) return
    const validBars = bars.filter(bar => bar && bar.length > 0)
    const playerBars = stickingsToBars(validBars, instrumentMapping)
    playerRef.current.setBars(playerBars)
  }, [bars, instrumentMapping, isReady, hasPattern, playerRef])

  // Темп
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    playerRef.current.setTempo(tempo)
  }, [tempo, isReady, playerRef])

  // Метроном on/off
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    if (metronome) {
      playerRef.current.playMetronome()
    } else {
      playerRef.current.stopMetronome()
    }
  }, [metronome, isReady, playerRef])

  // Громкость метронома
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    playerRef.current.setMetronomeVolume(metronomeVolume)
  }, [metronomeVolume, isReady, playerRef])

  // Маппинг инструментов
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    playerRef.current.setInstrumentMapping(instrumentMapping)
  }, [instrumentMapping, isReady, playerRef])

  const toggle = useCallback(() => {
    if (!playerRef.current || !drumKit || !hasPattern) return

    if (isPlaying) {
      stopPlayer()
      setInstrumentCounters(new Map())
      onBeatChange?.({ barIndex: 0, rhythmIndex: 0 })
    } else {
      resumeAudioContext()
      playerRef.current.play()
      setIsPlaying(true)
    }
  }, [
    playerRef,
    drumKit,
    hasPattern,
    isPlaying,
    stopPlayer,
    setIsPlaying,
    onBeatChange,
  ])

  // Space для play/pause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ') return

      const activeElement = document.activeElement
      const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A']
      if (activeElement && interactiveTags.includes(activeElement.tagName)) {
        return
      }

      event.preventDefault()
      toggle()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return { isLoading, drumKit, instrumentCounters, hasPattern, toggle }
}
