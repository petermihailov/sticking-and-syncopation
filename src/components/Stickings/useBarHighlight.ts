import { useCallback, useRef } from 'react'
import type { NotePositions } from '../../lib/notation'
import { useBarAlignment } from './useBarAlignment'
import { useFlamAnimation } from './useFlamAnimation'

interface BarHighlightOptions {
  itemCount: number
  notePositions?: NotePositions | null
  currentIndex?: number
  flamOffsetMs?: number
  /** Есть ли флэм на текущем бите */
  hasFlamAtCurrent: boolean
  /** CSS-класс grace-элемента внутри ячейки */
  graceClass: string
  /** CSS-класс основного элемента внутри ячейки */
  mainClass: string
}

/**
 * Общая логика подсветки для StickingBar и StrokeBar:
 * выравнивание по нотам + флэм-анимация + cellsRef.
 */
export function useBarHighlight({
  itemCount,
  notePositions,
  currentIndex,
  flamOffsetMs,
  hasFlamAtCurrent,
  graceClass,
  mainClass,
}: BarHighlightOptions) {
  const { containerStyle, aligned } = useBarAlignment(itemCount, notePositions)

  const cellsRef = useRef<(HTMLDivElement | null)[]>([])

  const getTarget = useCallback(
    (index: number) => {
      const cell = cellsRef.current[index]
      return {
        grace: cell?.querySelector<HTMLElement>(`.${graceClass}`) ?? null,
        main: cell?.querySelector<HTMLElement>(`.${mainClass}`) ?? null,
      }
    },
    [graceClass, mainClass]
  )

  useFlamAnimation(
    hasFlamAtCurrent ? currentIndex : undefined,
    flamOffsetMs,
    getTarget
  )

  return { containerStyle, aligned, cellsRef }
}
