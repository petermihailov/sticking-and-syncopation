import { useEffect, useRef } from 'react'
import { Renderer } from 'vexflow'
import type { NotationData } from '../../types/notation'
import {
  measureAndRender,
  STAVE_HEIGHT,
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

function renderToContainer(container: HTMLDivElement, notation: NotationData) {
  container.innerHTML = ''

  // SVG создаётся с запасом, после рендера уточняем размер
  const maxWidth = 2000
  const svgHeight = STAVE_HEIGHT + STAVE_Y_PADDING
  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(maxWidth, svgHeight)
  const context = renderer.getContext()

  const staveWidth = measureAndRender(
    context,
    notation,
    STAVE_X,
    STAVE_Y_PADDING,
    WIDTH_SCALE
  )
  renderer.resize(staveWidth + STAVE_X * 2, svgHeight)
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
    if (seeRef.current) {
      renderToContainer(seeRef.current, seeNotation)
    }
    if (playRef.current && playNotation) {
      renderToContainer(playRef.current, playNotation)
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
