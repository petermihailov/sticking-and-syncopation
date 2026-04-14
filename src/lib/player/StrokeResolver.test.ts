import { describe, it, expect } from 'vitest'
import {
  resolveStrokes,
  resolveFlamStrokes,
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

describe('resolveStrokes', () => {
  describe('без цикла', () => {
    it('два акцента одной руки → FF', () => {
      expect(strokesOnly(resolveStrokes(s('RR'), false))).toBe('FF')
    })

    it('акцент + гост → Dt', () => {
      expect(strokesOnly(resolveStrokes(s('Rr'), false))).toBe('Dt')
    })

    it('гост + акцент → uF', () => {
      expect(strokesOnly(resolveStrokes(s('rR'), false))).toBe('uF')
    })

    it('тройка Мёллера RrR → DuF', () => {
      expect(strokesOnly(resolveStrokes(s('RrR'), false))).toBe('DuF')
    })

    it('четвёрка RrrR → DtuF', () => {
      expect(strokesOnly(resolveStrokes(s('RrrR'), false))).toBe('DtuF')
    })

    it('руки независимы: RlRl → FtFt', () => {
      // Правая: R,R → F,F. Левая: l,l → t,t. Позиции сохраняются.
      expect(strokesOnly(resolveStrokes(s('RlRl'), false))).toBe('FtFt')
    })

    it('полный пример RlrrLrll → DuttDttt', () => {
      // Правая (R,r,r,r): D,t,t,t. Левая (l,L,l,l): u,D,t,t
      expect(strokesOnly(resolveStrokes(s('RlrrLrll'), false))).toBe('DuttDttt')
    })

    it('одиночный акцент → F', () => {
      expect(strokesOnly(resolveStrokes(s('R'), false))).toBe('F')
    })

    it('одиночный гост → t', () => {
      expect(strokesOnly(resolveStrokes(s('r'), false))).toBe('t')
    })

    it('пустой массив → пустой', () => {
      expect(resolveStrokes([], false)).toEqual([])
    })
  })

  describe('с циклом', () => {
    it('RlrrLrll зацикленный → DuttDutt', () => {
      // Правая (R,r,r,r → R...): D,t,t,u. Левая (l,L,l,l → l...): u,D,t,t
      // Левая: l(7)→l(1)=гост→гост=t (первая нота левой — l, не L!)
      expect(strokesOnly(resolveStrokes(s('RlrrLrll'), true))).toBe('DuttDutt')
    })

    it('RR зацикленный → FF (не меняется)', () => {
      expect(strokesOnly(resolveStrokes(s('RR'), true))).toBe('FF')
    })

    it('Rr зацикленный → Du (гост → акцент следующего цикла)', () => {
      expect(strokesOnly(resolveStrokes(s('Rr'), true))).toBe('Du')
    })

    it('rr зацикленный → tt (гост → гост)', () => {
      expect(strokesOnly(resolveStrokes(s('rr'), true))).toBe('tt')
    })

    it('одиночный R зацикленный → F (сам на себя)', () => {
      expect(strokesOnly(resolveStrokes(s('R'), true))).toBe('F')
    })

    it('одиночный r зацикленный → t (сам на себя)', () => {
      expect(strokesOnly(resolveStrokes(s('r'), true))).toBe('t')
    })
  })

  describe('кик и рест', () => {
    it('кик пропускается — null', () => {
      expect(strokesOnly(resolveStrokes(s('RkR'), false))).toBe('F_F')
    })

    it('рест пропускается — null, но рука видит сквозь рест', () => {
      // R и r — одна рука, рест между ними не разрывает цепочку: R→r=D, r(последняя)=t
      expect(strokesOnly(resolveStrokes(s('R r'), false))).toBe('D_t')
    })
  })

  describe('обе руки — сложные паттерны', () => {
    it('парадиддл RlRrLrLl → DDuuDDuu', () => {
      // Правая (R,R,r): D,D,u (нет — пересчитаю)
      // R(0) l(1) R(2) r(3) L(4) r(5) L(6) l(7)
      // Правая: R(0),R(2),r(3),r(5) → акценты: A,A,g,g
      //   R→R=F, R→r=D, r→r=t, r(последняя)=t → F,D,t,t
      // Левая: l(1),L(4),L(6),l(7) → акценты: g,A,A,g
      //   l→L=u, L→L=F, L→l=D, l(последняя)=t → u,F,D,t
      // Итого: F u D t F t D t
      expect(strokesOnly(resolveStrokes(s('RlRrLrLl'), false))).toBe('FuDtFtDt')
    })

    it('парадиддл RlRrLrLl зацикленный', () => {
      // Правая: R(0),R(2),r(3),r(5) → A,A,g,g → зацикл r(5)→R(0)
      //   R→R=F, R→r=D, r→r=t, r→R=u → F,D,t,u
      // Левая: l(1),L(4),L(6),l(7) → g,A,A,g → зацикл l(7)→l(1)
      //   l→L=u, L→L=F, L→l=D, l→l=t → u,F,D,t
      // Итого: F u D t F u D t
      expect(strokesOnly(resolveStrokes(s('RlRrLrLl'), true))).toBe('FuDtFuDt')
    })
  })
})

describe('resolveFlamStrokes', () => {
  // Хелпер: булевый массив флэмов из строки (1 = флэм, 0 = нет)
  function f(str: string): boolean[] {
    return str.split('').map(c => c === '1')
  }

  it('флэм перед R — грейс левой, следующая левая определяет тип', () => {
    // 'RlR — флэм на позиции 0, грейс = L (левая)
    // Следующая нота левой руки — l(1), гост → t
    const result = resolveFlamStrokes(s('RlR'), f('100'), false)
    expect(strokesOnly(result)).toBe('t__')
  })

  it('флэм перед L — грейс правой', () => {
    // 'LrL — флэм на позиции 0, грейс = R (правая)
    // Следующая нота правой — r(1), гост → t
    const result = resolveFlamStrokes(s('LrL'), f('100'), false)
    expect(strokesOnly(result)).toBe('t__')
  })

  it('грейс перед акцентом → u', () => {
    // 'RLR — флэм на 0, грейс = L, следующая левая — L(1) акцент → u
    const result = resolveFlamStrokes(s('RLR'), f('100'), false)
    expect(strokesOnly(result)).toBe('u__')
  })

  it('несколько флэмов', () => {
    // 'Rl'R — флэмы на 0 и 2
    // Позиция 0: грейс L, следующая левая — l(1) гост → t
    // Позиция 2: грейс L, следующая левой нет → t
    const result = resolveFlamStrokes(s('RlR'), f('101'), false)
    expect(strokesOnly(result)).toBe('t_t')
  })

  it('без флэмов — все null', () => {
    const result = resolveFlamStrokes(s('RlR'), f('000'), false)
    expect(strokesOnly(result)).toBe('___')
  })

  it('с циклом — грейс видит ноту руки из начала такта', () => {
    // 'RL — флэм на 0, грейс = L, с циклом следующая левая — L(1) акцент → u
    const result = resolveFlamStrokes(s('RL'), f('10'), true)
    expect(strokesOnly(result)).toBe('u_')
  })
})
