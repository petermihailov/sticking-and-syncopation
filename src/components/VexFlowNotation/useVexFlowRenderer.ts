import { useEffect, useRef } from 'react'
import { Renderer } from 'vexflow'
import type { NotationData } from '../../types/notation'
import { renderNotation, getStaveHeight, measureNotationWidth } from '../../lib/notation'

interface UseVexFlowRendererOptions {
  seeNotation: NotationData
  playNotation?: NotationData
}

const STAVE_X = 10
const STAVE_Y_PADDING = 30

function renderToContainer(
  container: HTMLDivElement,
  notation: NotationData,
  staveWidth: number
) {
  container.innerHTML = ''

  const totalWidth = staveWidth + STAVE_X * 2
  const staveHeight = getStaveHeight()
  const svgHeight = staveHeight + STAVE_Y_PADDING

  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(totalWidth, svgHeight)
  const context = renderer.getContext()

  renderNotation(context, notation, STAVE_X, STAVE_Y_PADDING, staveWidth)
}

export function useVexFlowRenderer({
  seeNotation,
  playNotation,
}: UseVexFlowRendererOptions) {
  const seeRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Считаем ширину для обоих станов и выравниваем по максимуму,
    // чтобы see- и play-стан были одинаковой ширины
    const seeWidth = measureNotationWidth(seeNotation)
    const playWidth = playNotation ? measureNotationWidth(playNotation) : 0
    const sharedWidth = Math.max(seeWidth, playWidth)

    if (seeRef.current) {
      renderToContainer(seeRef.current, seeNotation, sharedWidth)
    }
    if (playRef.current && playNotation) {
      renderToContainer(playRef.current, playNotation, sharedWidth)
    }
  }, [seeNotation, playNotation])

  return { seeRef, playRef }
}
