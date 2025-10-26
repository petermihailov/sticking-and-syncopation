import { useState, type FC, type CSSProperties } from 'react'
import { FavoritesModal } from '../FavoritesModal'
import { Toast } from '../Toast'

interface FavoritesButtonProps {
  className?: string
  style?: CSSProperties
}

/**
 * Button to open favorites modal
 */
export const FavoritesButton: FC<FavoritesButtonProps> = ({ className, style }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleMessage = (message: string, _error = false) => {
    setToastMessage(message)
    // Note: Toast component doesn't support error styling yet
    // Can be extended in the future if needed
  }

  return (
    <>
      <button onClick={handleOpenModal} className={className} style={style}>
        ⭐ Favorites
      </button>
      <FavoritesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMessage={handleMessage}
      />
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </>
  )
}
