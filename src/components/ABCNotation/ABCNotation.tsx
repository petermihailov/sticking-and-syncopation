import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import classes from './ABCNotation.module.css'
import { Stickings } from '../Stickings'
import { SVGFilters } from './SVGFilters'
import type { Sticking } from '../../types'

interface ABCNotationProps {
  seeNotation: string
  playNotation?: string
  bars?: Sticking[][]
  width?: number
  height?: number
  currentBeat?: { barIndex: number; rhythmIndex: number }
}

export function ABCNotation({
  seeNotation,
  playNotation,
  width = 420,
  bars = [],
  currentBeat: _currentBeat,
}: ABCNotationProps) {
  const notationRef = useRef<HTMLDivElement>(null)
  const [, setSelectedNotes] = useState<Set<string>>(new Set())

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
        clickListener: () => {
          console.log('Clicked note')
        },
      })
    }
  }, [seeNotation, playNotation, width])

  // Сбрасываем выделение при смене нотации
  useEffect(() => {
    setSelectedNotes(new Set())
  }, [seeNotation, playNotation])

  // TODO: Implement beat highlighting using currentBeat prop

  return (
    <div className={classes.container}>
      <SVGFilters />
      <div ref={notationRef} className={classes.notation} />
      {bars.length > 0 && bars[0].length > 0 && <Stickings bars={bars} />}
    </div>
  )
}
