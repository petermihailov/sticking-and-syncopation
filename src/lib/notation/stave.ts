import { Stave, Barline, type RenderContext } from 'vexflow'

interface StaveOptions {
  x: number
  y: number
  width: number
  timeSignature: { top: number; bottom: number }
  repeat: boolean
}

export function createStave(
  context: RenderContext,
  options: StaveOptions
): Stave {
  const stave = new Stave(options.x, options.y, options.width)
  stave.addClef('percussion')
  stave.addTimeSignature(
    `${options.timeSignature.top}/${options.timeSignature.bottom}`
  )

  if (options.repeat) {
    stave.setBegBarType(Barline.type.REPEAT_BEGIN)
    stave.setEndBarType(Barline.type.REPEAT_END)
  }

  stave.setContext(context).draw()
  return stave
}
