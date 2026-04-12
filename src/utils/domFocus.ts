/**
 * Утилиты для проверки активного DOM-элемента при обработке горячих клавиш.
 */

const TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
])

/**
 * true, если элемент — текстовое поле ввода, textarea или contentEditable.
 * Слайдеры (input[type=range]), чекбоксы, кнопки и т.п. сюда НЕ попадают.
 */
export function isTextInputElement(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  if (tag === 'TEXTAREA') return true
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type.toLowerCase()
    return TEXT_INPUT_TYPES.has(type)
  }
  return false
}

/** true, если элемент — `<input type="range">`. */
export function isRangeInput(el: Element | null): boolean {
  return el instanceof HTMLInputElement && el.type.toLowerCase() === 'range'
}
