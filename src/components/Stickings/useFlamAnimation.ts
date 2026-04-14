import { useEffect, useRef } from 'react'

/** Параметры анимации одной ячейки с флэмом */
interface FlamAnimationTarget {
  /** Элемент grace-note (flamPrefix / flamStroke) */
  grace: HTMLElement | null
  /** Элемент основной ноты (mainLabel / stroke) */
  main: HTMLElement | null
}

/**
 * Хук для анимации флэмов через Web Animations API.
 * Grace note анимируется мгновенно, основная нота — с задержкой flamOffsetMs.
 * При стопе (currentIndex === undefined) все анимации отменяются.
 */
export function useFlamAnimation(
  currentIndex: number | undefined,
  flamOffsetMs: number | undefined,
  getTarget: (index: number) => FlamAnimationTarget
) {
  const animationsRef = useRef<Animation[]>([])

  useEffect(() => {
    // Отменяем предыдущие анимации
    for (const a of animationsRef.current) a.cancel()
    animationsRef.current = []

    if (currentIndex === undefined || !flamOffsetMs) return

    const { grace, main } = getTarget(currentIndex)
    const animations: Animation[] = []

    // Grace note — мгновенный масштаб
    if (grace) {
      const a = grace.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }],
        { duration: 60, fill: 'forwards', easing: 'ease-out' }
      )
      animations.push(a)
    }

    // Основная нота — с задержкой, совпадающей с аудио
    if (main) {
      const a = main.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }],
        {
          duration: 60,
          delay: flamOffsetMs,
          fill: 'forwards',
          easing: 'ease-out',
        }
      )
      animations.push(a)
    }

    animationsRef.current = animations
  }, [currentIndex, flamOffsetMs, getTarget])

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      for (const a of animationsRef.current) a.cancel()
    }
  }, [])
}
