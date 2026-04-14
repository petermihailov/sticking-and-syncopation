import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { Player, type PlayerState } from '../lib/player'
import {
  createDrumKit,
  loadClickPack,
  resumeAudioContext,
} from '../utils/audio'
import { stickingsToBars } from '../utils/groove'
import { isTextInputElement, isRangeInput } from '../utils/domFocus'
import type { DrumKit } from '../types/kit'
import { useAppState } from './useAppState'
import { useNotation } from './useNotation'
import { PlayerControlContext, type Beat } from './usePlayerControl'

interface PlayerControlProviderProps {
  children: ReactNode
}

export function PlayerControlProvider({
  children,
}: PlayerControlProviderProps) {
  const { state } = useAppState()
  const {
    tempo,
    metronome,
    metronomeVolume,
    playbackVolume,
    metronomeSound,
    instrumentMapping,
  } = state
  const { convertResult, meter } = useNotation()
  const bars = convertResult.bars

  const playerRef = useRef<Player | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState<Beat>({
    barIndex: 0,
    rhythmIndex: 0,
  })
  const [drumKit, setDrumKit] = useState<DrumKit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [instrumentCounters, setInstrumentCounters] = useState<
    Map<string, number>
  >(new Map())

  const hasPattern = bars.length > 0 && bars[0].length > 0

  // Создаём плеер один раз, асинхронно подгружаем кит.
  // applyState ниже сам передаст кит в плеер, как только он будет готов.
  useEffect(() => {
    const player = new Player()
    player.setOnBeat(beat => {
      setCurrentBeat({
        barIndex: beat.barIndex,
        rhythmIndex: beat.rhythmIndex,
        flamOffsetMs: beat.flamOffsetMs,
      })
      setInstrumentCounters(player.getInstrumentCounters())
    })
    playerRef.current = player

    let cancelled = false
    setIsLoading(true)
    const basePath = `${import.meta.env.BASE_URL}sounds/`
    createDrumKit(basePath, 'mp3')
      .then(async kit => {
        if (cancelled) return
        // Загружаем выбранный клик-пак поверх дефолтных звуков метронома
        await loadClickPack(kit, state.metronomeSound, basePath, 'mp3')
        setDrumKit(kit)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load drum kit:', error)
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      player.stop()
      playerRef.current = null
    }
  }, [])

  // Подмена звуков метронома при смене клик-пака
  useEffect(() => {
    if (!drumKit) return
    const basePath = `${import.meta.env.BASE_URL}sounds/`
    loadClickPack(drumKit, metronomeSound, basePath, 'mp3')
      .then(() => {
        // Триггерим обновление drumKit, чтобы playerState пересчитался
        setDrumKit({ ...drumKit })
      })
      .catch(error => {
        console.error('Failed to load click pack:', error)
      })
  }, [metronomeSound]) // eslint-disable-line react-hooks/exhaustive-deps

  // Тяжёлый пересчёт тактов — только при смене нот/маппинга/метра.
  const computedBars = useMemo(() => {
    const validBars = bars.filter(bar => bar && bar.length > 0)
    return stickingsToBars(
      validBars,
      instrumentMapping,
      meter,
      convertResult.flams
    )
  }, [bars, instrumentMapping, meter, convertResult.flams])

  // Сборка состояния плеера — без громкости, она обновляется отдельно через setVolumes.
  const playerState = useMemo<PlayerState>(
    () => ({
      bars: computedBars,
      tempo,
      metronomeEnabled: metronome,
      metronomeVolume,
      playbackVolume,
      mapping: instrumentMapping,
      mutedGroups: [],
      kit: drumKit ?? undefined,
    }),
    [computedBars, tempo, metronome, instrumentMapping, drumKit]
  )

  useEffect(() => {
    playerRef.current?.applyState(playerState)
  }, [playerState])

  // Громкость обновляем напрямую, минуя пересборку playerState.
  useEffect(() => {
    playerRef.current?.setVolumes(playbackVolume, metronomeVolume)
  }, [playbackVolume, metronomeVolume])

  const play = useCallback(() => {
    if (playerRef.current && !isPlaying) {
      resumeAudioContext()
      playerRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const stop = useCallback(() => {
    if (playerRef.current && isPlaying) {
      playerRef.current.stop()
      setIsPlaying(false)
      setCurrentBeat({ barIndex: 0, rhythmIndex: 0 })
      setInstrumentCounters(new Map())
    }
  }, [isPlaying])

  const toggle = useCallback(() => {
    if (!playerRef.current || !drumKit || !hasPattern) return
    if (isPlaying) {
      stop()
    } else {
      play()
    }
  }, [drumKit, hasPattern, isPlaying, play, stop])

  // Space для play/pause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ') return

      const activeElement = document.activeElement

      // В текстовых полях пробел — это ввод символа.
      if (isTextInputElement(activeElement)) return

      // На слайдерах (темп и т.п.) снимаем фокус и переключаем плеер,
      // чтобы пробел срабатывал сразу после изменения значения.
      if (isRangeInput(activeElement)) {
        ;(activeElement as HTMLElement).blur()
        event.preventDefault()
        toggle()
        return
      }

      // Кнопки/ссылки: пробел активирует их штатно — не перехватываем.
      const tag = activeElement?.tagName
      if (tag === 'BUTTON' || tag === 'A' || tag === 'SELECT') return

      event.preventDefault()
      toggle()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  const value = {
    isPlaying,
    currentBeat,
    instrumentCounters,
    drumKit,
    isLoading,
    hasPattern,
    toggle,
  }

  return (
    <PlayerControlContext.Provider value={value}>
      {children}
    </PlayerControlContext.Provider>
  )
}
