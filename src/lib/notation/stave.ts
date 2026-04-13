import { Stave, Barline, type RenderContext } from 'vexflow'

interface StaveConfig {
  timeSignature: { top: number; bottom: number }
  repeat: boolean
}

interface StaveOptions extends StaveConfig {
  x: number
  y: number
  width: number
}

// Настраивает стан: клеф, размер, repeat-барлайны
function configureStave(stave: Stave, config: StaveConfig): Stave {
  stave.addClef('percussion')
  stave.addTimeSignature(
    `${config.timeSignature.top}/${config.timeSignature.bottom}`
  )
  if (config.repeat) {
    stave.setBegBarType(Barline.type.REPEAT_BEGIN)
    stave.setEndBarType(Barline.type.REPEAT_END)
  }
  return stave
}

// Создаёт стан без контекста — для измерения оверхеда (клеф + timesig + барлайны)
export function createProbeStave(config: StaveConfig): Stave {
  return configureStave(new Stave(0, 0, 500), config)
}

export function createStave(
  context: RenderContext,
  options: StaveOptions
): Stave {
  const stave = configureStave(
    new Stave(options.x, options.y, options.width),
    options
  )
  stave.setContext(context).draw()
  return stave
}
