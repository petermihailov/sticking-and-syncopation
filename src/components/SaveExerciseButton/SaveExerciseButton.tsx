import { useState, type FC } from 'react'
import { SaveExerciseModal } from '../SaveExerciseModal'
import { Toast } from '../Toast'

/**
 * Кнопка сохранения текущего пресета как пользовательского упражнения.
 */
export const SaveExerciseButton: FC = () => {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')

  return (
    <>
      <button onClick={() => setOpen(true)}>💾 Сохранить</button>
      <SaveExerciseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onMessage={setToast}
      />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  )
}
