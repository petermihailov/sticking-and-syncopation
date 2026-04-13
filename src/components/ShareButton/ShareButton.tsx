import { useState, type FC, type CSSProperties, type ReactNode } from 'react'
import { useAppState } from '../../context/useAppState'
import { Toast } from '../Toast'

interface ShareButtonProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export const ShareButton: FC<ShareButtonProps> = ({
  className,
  style,
  children,
}) => {
  const { shareUrl } = useAppState()
  const [showToast, setShowToast] = useState(false)
  const [error, setError] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setError(false)
      setShowToast(true)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      setError(true)
      setShowToast(true)
    }
  }

  return (
    <>
      <button onClick={handleShare} className={className} style={style}>
        {children ?? '🔗 Share'}
      </button>
      {showToast && (
        <Toast
          message={error ? 'Failed to copy link' : 'Link copied!'}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}
