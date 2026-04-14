import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import type { NotePositions } from '../../lib/notation'

interface BarAlignment {
  containerStyle: CSSProperties | undefined
  aligned: boolean
}

/**
 * Вычисляет стили flex-контейнера для выравнивания ячеек по позициям нот.
 */
export function useBarAlignment(
  itemCount: number,
  notePositions: NotePositions | null | undefined
): BarAlignment {
  return useMemo(() => {
    const aligned = !!notePositions && notePositions.xs.length > 1
    if (!aligned || !notePositions) {
      return { containerStyle: undefined, aligned: false }
    }

    const first = notePositions.xs[0]
    const last = notePositions.xs[notePositions.xs.length - 1]
    const svgW = notePositions.svgWidth
    const n = itemCount
    const span = last - first
    // Ширина контейнера такая, чтобы центры крайних flex-элементов
    // совпали с центрами крайних нот
    const w = n > 1 ? (span * n) / (n - 1) : span
    const ml = first - (w - span) / 2

    return {
      containerStyle: {
        marginLeft: `${(ml / svgW) * 100}%`,
        width: `${(w / svgW) * 100}%`,
      },
      aligned: true,
    }
  }, [itemCount, notePositions])
}
