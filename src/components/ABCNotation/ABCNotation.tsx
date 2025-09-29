import { useEffect, useRef } from 'react'
import abcjs from 'abcjs'
import classes from './ABCNotation.module.css'
import { Stickings } from './Stickings'
import { SVGFilters } from './SVGFilters'

interface ABCNotationProps {
  seeNotation: string
  playNotation?: string
  bars?: string[]
  width?: number
  height?: number
}

export function ABCNotation({
  seeNotation,
  playNotation,
  width = 420,
  bars,
}: ABCNotationProps) {
  const notationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (notationRef.current && seeNotation) {
      // Очищаем предыдущий контент
      notationRef.current.innerHTML = ''

      // Создаем объединенную нотацию
      let combinedNotation = seeNotation

      // Если есть playNotation, добавляем как второй такт
      if (playNotation) {
        // Извлекаем только ноты из playNotation (убираем заголовки)
        const playNotationLines = playNotation.split('\n')
        const playNotesLines = playNotationLines.filter(
          line =>
            line.startsWith('V:') || line.startsWith('|:') || line.includes('|')
        )

        // Добавляем к seeNotation
        combinedNotation = seeNotation + '\n' + playNotesLines.join('\n')
      }

      // Рендерим ABC нотацию
      abcjs.renderAbc(notationRef.current, combinedNotation, {
        responsive: 'resize',
        // viewportHorizontal: true,
        staffwidth: width,
        oneSvgPerLine: true,
        add_classes: true,
        initialClef: false,
        accentAbove: true,
        paddingtop: 0,
        format: {
          gchordfont: 'Arial 10',
          stretchlast: true,
        },
      })
    }
  }, [seeNotation, playNotation, width])

  return (
    <div className={classes.container}>
      <SVGFilters />
      <div ref={notationRef} className={classes.notation} />
      {/*<Labels />*/}
      {bars?.length && <Stickings bars={bars} />}
    </div>
  )
}
