import { useEffect, useRef } from 'react'

/** Параметры анимации одной ячейки с флэмом */
interface FlamAnimationTarget {
  /** Элемент grace-note (flamPrefix / flamStroke) */
  grace: HTMLElement | null
  /** Элемент основной ноты (mainLabel / stroke) */
  main: HTMLElement | null
}

import { ANIMATE_TRANSITIONS } from './animationConfig'

/** Длительность анимации выхода (ms) — совпадает с CSS transition обычных ячеек */
const EXIT_DURATION = ANIMATE_TRANSITIONS ? 150 : 0

/**
 * Хук для анимации флэмов через Web Animations API.
 *
 * Поведение аналогично обычным стикингам:
 * - вход: мгновенный scale (grace сразу, main с задержкой flamOffsetMs)
 * - выход: плавный scale(1.5) → scale(1) за 150ms ease-out
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

    // Анимация выхода для предыдущего бита
    if (prevIndex !== undefined) {
      const prev = getTarget(prevIndex)
      if (prev.grace) {
        prev.grace.animate(
          [{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }],
          { duration: EXIT_DURATION, easing: 'ease-out' }
        )
      }
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

    // Grace note — мгновенный масштаб (duration: 1ms, fill: forwards)
    if (grace) {
      const a = grace.animate([{ transform: 'scale(1.5)' }], {
        duration: 1,
        fill: 'forwards',
      })
      animations.push(a)
    }

    // Основная нота — мгновенный масштаб с задержкой, совпадающей с аудио
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
