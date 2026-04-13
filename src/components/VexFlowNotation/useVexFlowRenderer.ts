import { useEffect, useRef } from 'react'
import { Renderer } from 'vexflow'
import type { NotationData } from '../../types/notation'
import {
  renderNotation,
  STAVE_HEIGHT,
  measureNotationWidth,
} from '../../lib/notation'
import classes from './VexFlowNotation.module.css'

interface UseVexFlowRendererOptions {
  seeNotation: NotationData
  playNotation?: NotationData
  // Подсвечиваемая нота в play-стане. rhythmIndex соответствует индексу в
  // исходных стикингах и, следовательно, data-note-index в SVG.
  currentRhythmIndex?: number
  isPlaying?: boolean
}

const STAVE_X = 10
const STAVE_Y_PADDING = 30
// Множитель к минимальной ширине стана, чтобы ноты не лепились друг к другу
const WIDTH_SCALE = 1.5

function renderToContainer(
  container: HTMLDivElement,
  notation: NotationData,
  staveWidth: number
) {
  container.innerHTML = ''

  const totalWidth = staveWidth + STAVE_X * 2
  const staveHeight = STAVE_HEIGHT
  const svgHeight = staveHeight + STAVE_Y_PADDING

  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(totalWidth, svgHeight)
  const context = renderer.getContext()

  renderNotation(context, notation, STAVE_X, STAVE_Y_PADDING, staveWidth)
}

export function useVexFlowRenderer({
  seeNotation,
  playNotation,
  currentRhythmIndex,
  isPlaying,
}: UseVexFlowRendererOptions) {
  const seeRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Каждый стан рендерится по своей ширине (минимальная × WIDTH_SCALE)
    if (seeRef.current) {
      const w = Math.ceil(measureNotationWidth(seeNotation) * WIDTH_SCALE)
      renderToContainer(seeRef.current, seeNotation, w)
    }
    if (playRef.current && playNotation) {
      const w = Math.ceil(measureNotationWidth(playNotation) * WIDTH_SCALE)
      renderToContainer(playRef.current, playNotation, w)
    }
  }, [seeNotation, playNotation])

  // Подсветка текущей ноты только в play-стане. Снимает класс со старой
  // ноты и вешает на новую без повторного рендера всей нотации.
  useEffect(() => {
    const container = playRef.current
    if (!container) return

    const prev = container.querySelectorAll(`.${classes.currentNote}`)
    prev.forEach(el => el.classList.remove(classes.currentNote))

    if (!isPlaying || currentRhythmIndex === undefined) return

    const target = container.querySelector(
      `[data-note-index="${currentRhythmIndex}"]`
    )
    target?.classList.add(classes.currentNote)
  }, [currentRhythmIndex, isPlaying, playNotation])

  return { seeRef, playRef }
}
