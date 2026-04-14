import { useEffect, useRef } from 'react'

/** Параметры анимации одной ячейки с флэмом */
interface FlamAnimationTarget {
  /** Элемент grace-note (flamPrefix / flamStroke) */
  grace: HTMLElement | null
  /** Элемент основной ноты (mainLabel / stroke) */
  main: HTMLElement | null
}

import { ANIMATE_TRANSITIONS } from './animationConfig'

/** Длительность короткого «пульса» grace-ноты (ms) */
const PULSE_DURATION = 80
/** Длительность плавного уменьшения основной буквы при уходе (ms) */
const EXIT_DURATION = ANIMATE_TRANSITIONS ? 150 : 0

/**
 * Хук для анимации флэмов через Web Animations API.
 *
 * Поведение:
 * - grace (флэм): короткий пульс scale(1) → scale(1.5) → scale(1).
 *   При выключенных анимациях — мгновенный подскок и возврат.
 * - основная буква: масштаб до 1.5 с задержкой flamOffsetMs (синхронно с аудио)
 *   и удержание до следующего бита, где она плавно возвращается к scale(1).
 */
export function useFlamAnimation(
  currentIndex: number | undefined,
  flamOffsetMs: number | undefined,
  getTarget: (index: number) => FlamAnimationTarget
) {
  const activeRef = useRef<Animation[]>([])
  const prevIndexRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Отменяем предыдущие «входные» анимации
    for (const a of activeRef.current) a.cancel()
    activeRef.current = []

    const prevIndex = prevIndexRef.current
    prevIndexRef.current = currentIndex

    // Плавный уход основной буквы предыдущего флэм-бита
    if (prevIndex !== undefined) {
      const prev = getTarget(prevIndex)
      if (prev.main) {
        prev.main.animate(
          [{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }],
          { duration: EXIT_DURATION, easing: 'ease-out' }
        )
      }
    }

    if (currentIndex === undefined || !flamOffsetMs) return

    const { grace, main } = getTarget(currentIndex)
    const animations: Animation[] = []

    // Grace-нота — короткий пульс. При выключенных анимациях — мгновенный
    // скачок до scale(1.5) и обратно через PULSE_DURATION (без сглаживания).
    if (grace) {
      const a = ANIMATE_TRANSITIONS
        ? grace.animate(
            [
              { transform: 'scale(1)' },
              { transform: 'scale(1.5)' },
              { transform: 'scale(1)' },
            ],
            { duration: PULSE_DURATION, easing: 'ease-out' }
          )
        : grace.animate(
            [
              { transform: 'scale(1.5)', offset: 0 },
              { transform: 'scale(1)', offset: 1 },
            ],
            { duration: PULSE_DURATION, easing: 'step-end' }
          )
      animations.push(a)
    }

    // Основная буква — масштаб с задержкой, удерживается до ухода
    if (main) {
      const a = main.animate([{ transform: 'scale(1.5)' }], {
        duration: 1,
        delay: flamOffsetMs,
        fill: 'forwards',
      })
      animations.push(a)
    }

    activeRef.current = animations
  }, [currentIndex, flamOffsetMs, getTarget])

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      for (const a of activeRef.current) a.cancel()
    }
  }, [])
}
