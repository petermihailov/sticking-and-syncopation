import { describe, it, expect } from 'vitest'
import {
  resolveAllStrokes,
  resolveStrokes,
  type StrokeType,
} from './StrokeResolver'
import type { Sticking } from '../../types'

// Хелпер: строку стикинга → массив Sticking[]
function s(str: string): Sticking[] {
  return str.split('') as Sticking[]
}

// Хелпер: только stroke types без null (для кика/реста)
function strokesOnly(result: (StrokeType | null)[]): string {
  return result.map(v => v ?? '_').join('')
}

// Хелпер: булевый массив флэмов из строки (1 = флэм, 0 = нет)
function f(str: string): boolean[] {
  return str.split('').map(c => c === '1')
}

describe('resolveAllStrokes', () => {
  // Обёртка для краткости — только основные strokes, без флэмов
  function strokes(stickings: string, loop: boolean): string {
    return strokesOnly(
      resolveAllStrokes({ stickings: s(stickings), loop }).strokes
    )
  }

  describe('без цикла', () => {
    it('два акцента одной руки → FF', () => {
      expect(strokes('RR', false)).toBe('FF')
    })

    it('акцент + гост → Dt', () => {
      expect(strokes('Rr', false)).toBe('Dt')
    })

    it('гост + акцент → uF', () => {
      expect(strokes('rR', false)).toBe('uF')
    })

    it('тройка Мёллера RrR → DuF', () => {
      expect(strokes('RrR', false)).toBe('DuF')
    })

    it('четвёрка RrrR → DtuF', () => {
      expect(strokes('RrrR', false)).toBe('DtuF')
    })

    it('руки независимы: RlRl → FtFt', () => {
      expect(strokes('RlRl', false)).toBe('FtFt')
    })

    it('полный пример RlrrLrll → DuttDttt', () => {
      expect(strokes('RlrrLrll', false)).toBe('DuttDttt')
    })

    it('одиночный акцент → F', () => {
      expect(strokes('R', false)).toBe('F')
    })

    it('одиночный гост → t', () => {
      expect(strokes('r', false)).toBe('t')
    })

    it('пустой массив → пустой', () => {
      expect(resolveAllStrokes({ stickings: [], loop: false }).strokes).toEqual(
        []
      )
    })
  })

  describe('с циклом', () => {
    it('RlrrLrll зацикленный → DuttDutt', () => {
      expect(strokes('RlrrLrll', true)).toBe('DuttDutt')
    })

    it('RR зацикленный → FF', () => {
      expect(strokes('RR', true)).toBe('FF')
    })

    it('Rr зацикленный → Du', () => {
      expect(strokes('Rr', true)).toBe('Du')
    })

    it('rr зацикленный → tt', () => {
      expect(strokes('rr', true)).toBe('tt')
    })

    it('одиночный R зацикленный → F', () => {
      expect(strokes('R', true)).toBe('F')
    })

    it('одиночный r зацикленный → t', () => {
      expect(strokes('r', true)).toBe('t')
    })
  })

  describe('кик и рест', () => {
    it('кик пропускается — null', () => {
      expect(strokes('RkR', false)).toBe('F_F')
    })

    it('рест пропускается — null, но рука видит сквозь рест', () => {
      expect(strokes('R r', false)).toBe('D_t')
    })
  })

  describe('обе руки — сложные паттерны', () => {
    it('парадиддл RlRrLrLl → FuDtFtDt', () => {
      expect(strokes('RlRrLrLl', false)).toBe('FuDtFtDt')
    })

    it('парадиддл RlRrLrLl зацикленный', () => {
      expect(strokes('RlRrLrLl', true)).toBe('FuDtFuDt')
    })
  })

  describe('флэм-грейсы', () => {
    it('флэм перед R — грейс левой, следующая левая гост → t', () => {
      // RlR, флэм на 0: левая рука = [grace_l(0), l(1)], оба гост → t, t
      const { flamStrokes } = resolveAllStrokes({
        stickings: s('RlR'),
        flams: f('100'),
        loop: false,
      })
      expect(strokesOnly(flamStrokes)).toBe('t__')
    })

    it('флэм перед L — грейс правой', () => {
      const { flamStrokes } = resolveAllStrokes({
        stickings: s('LrL'),
        flams: f('100'),
        loop: false,
      })
      expect(strokesOnly(flamStrokes)).toBe('t__')
    })

    it('грейс перед акцентом → u', () => {
      // RLR, флэм на 0: левая = [grace_l(0), L(1)], гост→акцент = u
      const { flamStrokes } = resolveAllStrokes({
        stickings: s('RLR'),
        flams: f('100'),
        loop: false,
      })
      expect(strokesOnly(flamStrokes)).toBe('u__')
    })

    it('с циклом — грейс видит ноту из начала такта', () => {
      // RL, флэм на 0: левая = [grace_l(0), L(1)]
      // С циклом: L(1)→grace_l(0) = акцент→гост, grace_l(0)→L(1) = гост→акцент
      const { flamStrokes } = resolveAllStrokes({
        stickings: s('RL'),
        flams: f('10'),
        loop: true,
      })
      expect(strokesOnly(flamStrokes)).toBe('u_')
    })

    it('два грейса одной руки подряд — t u, не u u', () => {
      // RLRl, флэмы на 0 и 2: грейсы оба левой рукой
      // Левая: grace_l(0), L(1), grace_l(2), l(3)
      //   grace_l(0)→L(1): гост→акцент = u
      //   L(1)→grace_l(2): акцент→гост = D
      //   grace_l(2)→l(3): гост→гост = t
      //   l(3) конец без цикла: гост = t
      const { strokes, flamStrokes } = resolveAllStrokes({
        stickings: s('RLRl'),
        flams: f('1010'),
        loop: false,
      })
      expect(strokesOnly(strokes)).toBe('FDFt')
      expect(strokesOnly(flamStrokes)).toBe('u_t_')
    })

    it('флэм влияет на stroke основной ноты с циклом', () => {
      // RL, флэм на 0: левая = [grace_l(0), L(1)]
      // С циклом: L(1)→grace_l(0) акцент→гост = D
      const { strokes, flamStrokes } = resolveAllStrokes({
        stickings: s('RL'),
        flams: f('10'),
        loop: true,
      })
      // Правая: R(0) единственная, цикл на себя → F
      // Левая: L(1)→grace(0) = D, grace(0)→L(1) = u
      expect(strokesOnly(strokes)).toBe('FD')
      expect(strokesOnly(flamStrokes)).toBe('u_')
    })

    it('без флэмов — flamStrokes все null', () => {
      const { flamStrokes } = resolveAllStrokes({
        stickings: s('RlR'),
        loop: false,
      })
      expect(strokesOnly(flamStrokes)).toBe('___')
    })
  })
})

describe('resolveStrokes (обёртка)', () => {
  it('делегирует в resolveAllStrokes без флэмов', () => {
    expect(strokesOnly(resolveStrokes(s('RlRrLrLl'), true))).toBe('FuDtFuDt')
  })
})
