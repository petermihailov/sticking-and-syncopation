import { useEffect, useRef } from 'react'
import { Renderer } from 'vexflow'
import type { NotationData } from '../../types/notation'
import { renderNotation, getStaveHeight } from '../../lib/notation'

interface UseVexFlowRendererOptions {
  seeNotation: NotationData
  playNotation?: NotationData
  width: number
}

const STAVE_X = 10
const STAVE_Y_PADDING = 30

function renderToContainer(
  container: HTMLDivElement,
  notation: NotationData,
  width: number
) {
  container.innerHTML = ''

  const staveWidth = width - STAVE_X * 2
  const staveHeight = getStaveHeight()
  const svgHeight = staveHeight + STAVE_Y_PADDING

  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(width, svgHeight)
  const context = renderer.getContext()

  renderNotation(context, notation, STAVE_X, STAVE_Y_PADDING, staveWidth)
}

export function useVexFlowRenderer({
  seeNotation,
  playNotation,
  width,
}: UseVexFlowRendererOptions) {
  const seeRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (seeRef.current) {
      renderToContainer(seeRef.current, seeNotation, width)
    }
  }, [seeNotation, width])

  useEffect(() => {
    if (playRef.current && playNotation) {
      renderToContainer(playRef.current, playNotation, width)
    }
  }, [playNotation, width])

  return { seeRef, playRef }
}
