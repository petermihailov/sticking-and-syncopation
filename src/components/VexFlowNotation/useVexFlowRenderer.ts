import { useEffect, useRef, useState } from 'react'
import { Renderer } from 'vexflow'
import type { NotationData } from '../../types/notation'
import {
  measureAndRender,
  renderNotation,
  measureNotationWidth,
  STAVE_HEIGHT,
  type NotePositions,
} from '../../lib/notation'
import { rhythmToAccentIndex } from '../../lib/notation/rhythmMapping'
import classes from './VexFlowNotation.module.css'

interface UseVexFlowRendererOptions {
  seeNotation: NotationData
  playNotation?: NotationData
  // Подсвечиваемая нота в play-стане. rhythmIndex соответствует индексу в
  // исходных стикингах и, следовательно, data-note-index в SVG.
  currentRhythmIndex?: number
  isPlaying?: boolean
  /** Кол-во нот на долю в play-нотации (для маппинга на see-нотацию) */
  notesPerBeat?: number
  /** Выровнять ширину see и play станов по максимальной */
  matchWidth?: boolean
}

const STAVE_X = 10
const STAVE_Y_PADDING = 30
// Множитель к минимальной ширине стана, чтобы ноты не лепились друг к другу
const WIDTH_SCALE = 1.5

/** Снимает старую подсветку и ставит .currentNote на элемент с нужным data-note-index */
function highlightNoteInContainer(
  container: HTMLElement | null,
  noteIndex: number | undefined,
  cssClass: string
) {
  if (!container) return
  const prev = container.querySelectorAll(`.${cssClass}`)
  prev.forEach(el => el.classList.remove(cssClass))
  if (noteIndex === undefined) return

  const target = container.querySelector(`[data-note-index="${noteIndex}"]`)
  target?.classList.add(cssClass)
}

/**
 * Для see-нотации: ищет ближайший data-note-index ≤ target
 * (из-за collapseAccentPairs точного элемента может не быть)
 */
function highlightClosestNoteInContainer(
  container: HTMLElement | null,
  noteIndex: number | undefined,
  cssClass: string
) {
  if (!container) return
  const prev = container.querySelectorAll(`.${cssClass}`)
  prev.forEach(el => el.classList.remove(cssClass))
  if (noteIndex === undefined) return

  const allNotes = container.querySelectorAll('[data-note-index]')
  let best: Element | null = null
  let bestIndex = -1
  for (const el of allNotes) {
    const idx = Number(el.getAttribute('data-note-index'))
    if (idx <= noteIndex && idx > bestIndex) {
      bestIndex = idx
      best = el
    }
  }
  best?.classList.add(cssClass)
}

function renderToContainer(
  container: HTMLDivElement,
  notation: NotationData,
  fixedWidth?: number
): NotePositions {
  container.innerHTML = ''

  const svgHeight = STAVE_HEIGHT + STAVE_Y_PADDING
  const renderer = new Renderer(container, Renderer.Backends.SVG)

  if (fixedWidth !== undefined) {
    renderer.resize(fixedWidth + STAVE_X * 2, svgHeight)
    const context = renderer.getContext()
    return renderNotation(
      context,
      notation,
      STAVE_X,
      STAVE_Y_PADDING,
      fixedWidth
    )
  } else {
    renderer.resize(2000, svgHeight)
    const context = renderer.getContext()
    const { width, notePositions } = measureAndRender(
      context,
      notation,
      STAVE_X,
      STAVE_Y_PADDING,
      WIDTH_SCALE
    )
    renderer.resize(width + STAVE_X * 2, svgHeight)
    return notePositions
  }
}

export function useVexFlowRenderer({
  seeNotation,
  playNotation,
  currentRhythmIndex,
  isPlaying,
  notesPerBeat,
  matchWidth = false,
}: UseVexFlowRendererOptions) {
  const seeRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLDivElement>(null)
  const [playNotePositions, setPlayNotePositions] =
    useState<NotePositions | null>(null)

  useEffect(() => {
    // При matchWidth измеряем обе ширины и берём максимум
    const fixedWidth =
      matchWidth && playNotation
        ? Math.max(
            Math.ceil(measureNotationWidth(seeNotation) * WIDTH_SCALE),
            Math.ceil(measureNotationWidth(playNotation) * WIDTH_SCALE)
          )
        : undefined

    if (seeRef.current) {
      renderToContainer(seeRef.current, seeNotation, fixedWidth)
    }
    if (playRef.current && playNotation) {
      const positions = renderToContainer(
        playRef.current,
        playNotation,
        fixedWidth
      )
      setPlayNotePositions(positions)
    }
  }, [seeNotation, playNotation, matchWidth])

  // Подсветка текущей ноты в play-стане
  useEffect(() => {
    const idx = isPlaying ? currentRhythmIndex : undefined
    highlightNoteInContainer(playRef.current, idx, classes.currentNote)
  }, [currentRhythmIndex, isPlaying, playNotation])

  // Подсветка текущей позиции в see-стане (маппинг через rhythmToAccentIndex,
  // ищет ближайший data-note-index ≤ target из-за collapseAccentPairs)
  useEffect(() => {
    const idx =
      isPlaying && currentRhythmIndex !== undefined && notesPerBeat
        ? rhythmToAccentIndex(currentRhythmIndex, notesPerBeat)
        : undefined
    highlightClosestNoteInContainer(seeRef.current, idx, classes.currentNote)
  }, [currentRhythmIndex, isPlaying, notesPerBeat, seeNotation])

  return { seeRef, playRef, playNotePositions }
}
