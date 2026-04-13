/**
 * Маппинг rhythmIndex (play-нотация) → accentIndex (see-нотация).
 *
 * See-нотация — восьмые (8 позиций на такт 4/4).
 * Play-нотация зависит от типа рудимента:
 *   - 16th (notesPerBeat=4): 16 нот → 8 акцентов, 2:1
 *   - 8th triplets (notesPerBeat=3): 12 нот → 8 акцентов, 3:2
 *   - 16th triplets (notesPerBeat=6): 24 ноты → 8 акцентов, 6:2
 */
export function rhythmToAccentIndex(
  rhythmIndex: number,
  notesPerBeat: number
): number {
  switch (notesPerBeat) {
    case 4:
      // 2 шестнадцатых на 1 восьмую
      return Math.floor(rhythmIndex / 2)
    case 3: {
      // Триоль: 3 ноты покрывают 2 позиции акцентов
      // Ноты 0,1 → первый акцент группы; нота 2 → второй
      const group = Math.floor(rhythmIndex / 3)
      return group * 2 + (rhythmIndex % 3 >= 2 ? 1 : 0)
    }
    case 6: {
      // Секстоль: 6 нот покрывают 2 позиции акцентов
      // Пропорция как на триолях (2/3 группы): 6 × 2/3 = 4
      // Ноты 0–3 → первый акцент; ноты 4–5 → второй
      const group = Math.floor(rhythmIndex / 6)
      return group * 2 + (rhythmIndex % 6 >= 4 ? 1 : 0)
    }
    default:
      return rhythmIndex
  }
}
